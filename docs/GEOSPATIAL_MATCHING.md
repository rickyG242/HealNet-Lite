# Geospatial Matching System

This document provides an overview of the geospatial matching system implemented in HealNet-Lite, which enhances the matching of donations to needs based on geographic proximity and other factors.

## Overview

The geospatial matching system adds location intelligence to the donation matching process, enabling:

- **Precise Distance Calculations**: Using both straight-line (as-the-crow-flies) and driving distance calculations.
- **Intelligent Matching**: Prioritizing matches based on proximity, urgency, and other factors.
- **Geocoding**: Converting addresses to geographic coordinates for spatial queries.
- **Performance Optimization**: Using spatial indexes and efficient algorithms for fast queries.

## Components

### 1. Database Schema

#### Tables
- `donations`: Stores donation information with geospatial fields.
- `needs`: Stores organization needs with geospatial fields.
- `geocoding_cache`: Caches geocoding results to reduce API calls.

#### Spatial Columns
- `lat`, `lng`: Standard latitude and longitude (double precision)
- `geog`: Geography type for spatial operations (PostGIS)
- `formatted_address`: Standardized address from geocoding
- `geocode_quality`: Quality indicator for the geocoding result
- `geocoded_at`: Timestamp of when geocoding was performed

### 2. Services

#### `geocodingService.ts`
- Handles geocoding of addresses using Mapbox (primary) and Nominatim (fallback).
- Implements caching to reduce API usage.
- Provides quality assessment of geocoding results.

#### `distanceService.ts`
- Calculates distances between points using various methods.
- Integrates with Mapbox Directions API for accurate driving distances.
- Provides estimated driving times and logistics costs.

#### `matchingService.ts`
- Implements the core matching algorithm.
- Scores potential matches based on multiple factors:
  - Category match
  - Item similarity
  - Distance/proximity
  - Urgency
  - Quantity
  - Recency

#### `geocodeWorker.ts`
- Background worker for batch geocoding of donations and needs.
- Processes records in batches to avoid overwhelming the system.
- Handles rate limiting and retries.

### 3. Frontend Components

#### `MatchResultsList.tsx`
- Displays a list of matched needs for a donation.
- Shows match quality, distance, and other relevant information.
- Allows users to view details and contact organizations.

#### `DonationForm.tsx`
- Enhanced to support geocoding of donation locations.
- Provides real-time feedback on location quality.
- Submits donation with geospatial data.

### 4. Hooks

#### `useGeocodeWorker.ts`
- Manages the lifecycle of the geocoding worker.
- Ensures the worker is properly started and stopped.

## How It Works

1. **Donation Submission**:
   - User submits a donation with a location.
   - The location is geocoded to get coordinates.
   - Donation is saved with geospatial data.

2. **Matching Process**:
   - The system finds needs with matching categories.
   - For each potential match, it calculates a score based on:
     - Category match (exact match required)
     - Item similarity (text similarity)
     - Distance (closer is better)
     - Urgency (higher urgency increases score)
     - Quantity (better matches for larger quantities)
     - Recency (newer needs get a slight boost)

3. **Results Display**:
   - Matches are sorted by score.
   - Users can view details and contact organizations.
   - Driving directions and logistics information are provided.

## Configuration

### Environment Variables

```env
# Required
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token

# Optional
VITE_GEOCODING_PROVIDER=mapbox # or 'nominatim'
VITE_GEOCODING_CACHE_TTL=2592000 # 30 days in seconds
```

## Performance Considerations

- **Spatial Indexes**: Ensure you have spatial indexes on the `geog` columns for fast distance queries.
- **Batch Processing**: The geocoding worker processes records in batches to avoid overwhelming the system.
- **Caching**: Geocoding results are cached to reduce API calls and improve performance.
- **Fallback Mechanisms**: The system gracefully degrades when external services are unavailable.

## Extending the System

### Adding a New Geocoding Provider

1. Create a new class that implements the `GeocodingProvider` interface.
2. Add it to the `GeocodingService` constructor options.
3. Update the environment configuration if needed.

### Customizing the Matching Algorithm

1. Modify the scoring logic in `matchingService.ts`.
2. Adjust the weights in the `WEIGHTS` constant to prioritize different factors.
3. Add new scoring functions as needed.

## Troubleshooting

### Common Issues

1. **Geocoding Failures**:
   - Check your API keys and quotas.
   - Verify that the address format is correct.
   - Check the `geocode_quality` field for low-quality results.

2. **Slow Queries**:
   - Ensure you have spatial indexes on the `geog` columns.
   - Check for missing or outdated statistics with `ANALYZE`.
   - Consider increasing the `work_mem` setting for complex spatial queries.

3. **Inaccurate Matches**:
   - Review the scoring weights in `matchingService.ts`.
   - Check the quality of the geocoding results.
   - Consider adding more factors to the scoring algorithm.

## Future Improvements

- **Real-time Updates**: Use Supabase Realtime to update matches in real-time.
- **Advanced Routing**: Integrate with logistics providers for more accurate delivery estimates.
- **Machine Learning**: Train a model to improve match quality based on historical data.
- **Multi-stop Optimization**: Optimize routes for donors with multiple items to donate.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
