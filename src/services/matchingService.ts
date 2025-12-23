import { geocodingService } from './geocodingService';
import { distanceService } from './distanceService';
import { createClient } from '@supabase/supabase-js';

interface MatchScore {
  total: number;
  category: number;
  distance: number;
  urgency: number;
  quantity: number;
  itemSimilarity: number;
  recency: number;
}

interface ScoredMatch {
  need: any; // Replace with your Need type
  score: MatchScore;
  distanceKm: number;
  drivingTimeMinutes: number;
  logisticsCost: number;
  matchQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

class MatchingService {
  private supabase;
  
  // Scoring weights (adjust based on your requirements)
  private readonly WEIGHTS = {
    category: 0.25,
    distance: 0.25,
    urgency: 0.2,
    quantity: 0.15,
    itemSimilarity: 0.1,
    recency: 0.05
  };
  
  // Thresholds for match quality
  private readonly QUALITY_THRESHOLDS = {
    excellent: 0.8,
    good: 0.6,
    fair: 0.4
  };

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  /**
   * Find the best matches for a donation
   */
  async findBestMatches(donation: any, maxDistanceKm: number = 50, limit: number = 10): Promise<ScoredMatch[]> {
    try {
      // Ensure donation has coordinates
      if (!donation.lat || !donation.lng) {
        await this.geocodeDonation(donation);
      }

      // Find needs within the specified radius
      const needs = await distanceService.findNeedsWithinRadius(
        donation.lat,
        donation.lng,
        maxDistanceKm,
        limit * 3 // Get more needs than needed to ensure we have enough after filtering
      );

      // Score each potential match
      const scoredMatches = await Promise.all(
        needs.map(need => this.scoreMatch(donation, need))
      );

      // Sort by total score (descending) and take the top matches
      return scoredMatches
        .filter(match => match.score.total > 0.2) // Filter out very poor matches
        .sort((a, b) => b.score.total - a.score.total)
        .slice(0, limit);
    } catch (error) {
      console.error('Error finding matches:', error);
      return [];
    }
  }

  /**
   * Score a single donation-need pair
   */
  private async scoreMatch(donation: any, need: any): Promise<ScoredMatch> {
    // Calculate distance metrics
    const distanceResult = await distanceService.calculateDrivingDistance(
      { lat: donation.lat, lng: donation.lng },
      { lat: need.lat, lng: need.lng }
    );

    // Calculate individual scores
    const categoryScore = this.scoreCategoryMatch(donation.category, need.category);
    const distanceScore = this.scoreDistance(distanceResult.distanceKm);
    const urgencyScore = this.scoreUrgency(need.urgency);
    const quantityScore = this.scoreQuantity(donation.quantity, need.quantity);
    const itemSimilarityScore = this.scoreItemSimilarity(donation.item, need.item);
    const recencyScore = this.scoreRecency(need.created_at);

    // Calculate weighted total score (0-1)
    const totalScore = 
      (categoryScore * this.WEIGHTS.category) +
      (distanceScore * this.WEIGHTS.distance) +
      (urgencyScore * this.WEIGHTS.urgency) +
      (quantityScore * this.WEIGHTS.quantity) +
      (itemSimilarityScore * this.WEIGHTS.itemSimilarity) +
      (recencyScore * this.WEIGHTS.recency);

    return {
      need,
      score: {
        total: this.normalizeScore(totalScore),
        category: categoryScore,
        distance: distanceScore,
        urgency: urgencyScore,
        quantity: quantityScore,
        itemSimilarity: itemSimilarityScore,
        recency: recencyScore
      },
      distanceKm: distanceResult.distanceKm,
      drivingTimeMinutes: distanceResult.drivingTimeMinutes,
      logisticsCost: distanceResult.logisticsCost,
      matchQuality: this.determineMatchQuality(totalScore)
    };
  }

  /**
   * Ensure a score is between 0 and 1
   */
  private normalizeScore(score: number): number {
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Determine match quality based on score
   */
  private determineMatchQuality(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= this.QUALITY_THRESHOLDS.excellent) return 'excellent';
    if (score >= this.QUALITY_THRESHOLDS.good) return 'good';
    if (score >= this.QUALITY_THRESHOLDS.fair) return 'fair';
    return 'poor';
  }

  /**
   * Score category match (exact match only for now)
   */
  private scoreCategoryMatch(donorCategory: string, needCategory: string): number {
    return donorCategory.toLowerCase() === needCategory.toLowerCase() ? 1 : 0;
  }

  /**
   * Score distance (closer is better)
   */
  private scoreDistance(distanceKm: number): number {
    // Convert distance to a score between 0 and 1
    // Closer distances score higher, with a smooth falloff
    const maxDistance = 100; // km
    return Math.max(0, 1 - (Math.min(distanceKm, maxDistance) / maxDistance));
  }

  /**
   * Score urgency (higher urgency gets higher score)
   */
  private scoreUrgency(urgency: string): number {
    const urgencyScores: Record<string, number> = {
      'critical': 1.0,
      'high': 0.75,
      'medium': 0.5,
      'low': 0.25,
      'none': 0.1
    };
    
    return urgencyScores[urgency.toLowerCase()] || 0.1;
  }

  /**
   * Score quantity match (closer quantities score higher)
   */
  private scoreQuantity(donorQty: number, needQty: number): number {
    if (donorQty <= 0 || needQty <= 0) return 0;
    
    // Calculate ratio (closer to 1 is better)
    const ratio = Math.min(donorQty, needQty) / Math.max(donorQty, needQty);
    
    // Bonus if donor has more than needed
    const surplusBonus = donorQty >= needQty ? 0.2 : 0;
    
    return Math.min(1, ratio + surplusBonus);
  }

  /**
   * Score item similarity using Levenshtein distance
   */
  private scoreItemSimilarity(item1: string, item2: string): number {
    if (!item1 || !item2) return 0;
    
    const str1 = item1.toLowerCase().trim();
    const str2 = item2.toLowerCase().trim();
    
    // Exact match
    if (str1 === str2) return 1;
    
    // Check for substring match
    if (str1.includes(str2) || str2.includes(str1)) return 0.8;
    
    // Check for word overlap
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    
    if (intersection.size > 0) {
      return 0.5 + (intersection.size / Math.max(words1.size, words2.size) * 0.3);
    }
    
    // No match
    return 0;
  }

  /**
   * Score recency (newer needs get slightly higher scores)
   */
  private scoreRecency(timestamp: string): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const needDate = new Date(timestamp);
    const daysOld = (Date.now() - needDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Linear decay over 30 days
    return Math.max(0, 1 - (daysOld / 30));
  }

  /**
   * Geocode a donation if it doesn't have coordinates
   */
  private async geocodeDonation(donation: any): Promise<void> {
    if (!donation.location) return;
    
    try {
      const result = await geocodingService.geocode(donation.location);
      
      if (result.quality !== 'failed') {
        donation.lat = result.lat;
        donation.lng = result.lng;
        donation.formatted_address = result.formattedAddress;
        
        // Update the donation in the database
        await this.supabase
          .from('donations')
          .update({
            lat: result.lat,
            lng: result.lng,
            formatted_address: result.formattedAddress,
            geocode_quality: result.quality,
            geocoded_at: new Date().toISOString()
          })
          .eq('id', donation.id);
      }
    } catch (error) {
      console.error('Error geocoding donation:', error);
    }
  }
}

export const matchingService = new MatchingService();
