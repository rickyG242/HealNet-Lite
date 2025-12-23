/**
 * Geo-related utility functions and types
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  ne: Coordinates; // Northeast corner
  sw: Coordinates; // Southwest corner
}

/**
 * Calculate the distance between two points in kilometers using the Haversine formula
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance in a human-readable way
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  } else if (km < 10) {
    return `${km.toFixed(1)}km`;
  } else {
    return `${Math.round(km)}km`;
  }
}

/**
 * Format driving time in a human-readable way
 */
export function formatDrivingTime(minutes: number): string {
  if (minutes < 1) {
    return 'less than a minute';
  } else if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`;
  }
}

/**
 * Generate a bounding box around a point with a given radius in kilometers
 */
export function getBoundingBox(center: Coordinates, radiusKm: number): BoundingBox {
  // Earth's radius in km
  const R = 6371;
  
  // Convert latitude and longitude to radians
  const latRad = toRad(center.lat);
  const lngRad = toRad(center.lng);
  
  // Angular distance in radians
  const dLat = radiusKm / R;
  const dLng = Math.asin(Math.sin(dLat) / Math.cos(latRad));
  
  // Convert back to degrees
  const lat1 = center.lat + toDeg(dLat);
  const lat2 = center.lat - toDeg(dLat);
  const lng1 = center.lng + toDeg(dLng);
  const lng2 = center.lng - toDeg(dLng);
  
  return {
    ne: { lat: lat1, lng: lng1 },
    sw: { lat: lat2, lng: lng2 }
  };
}

/**
 * Convert radians to degrees
 */
function toDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculate the center point of multiple coordinates
 */
export function getCenter(coords: Coordinates[]): Coordinates {
  if (coords.length === 0) {
    return { lat: 0, lng: 0 };
  }
  
  if (coords.length === 1) {
    return coords[0];
  }
  
  let x = 0;
  let y = 0;
  let z = 0;
  
  // Convert to cartesian coordinates
  for (const coord of coords) {
    const latRad = toRad(coord.lat);
    const lngRad = toRad(coord.lng);
    
    x += Math.cos(latRad) * Math.cos(lngRad);
    y += Math.cos(latRad) * Math.sin(lngRad);
    z += Math.sin(latRad);
  }
  
  // Convert back to degrees
  const total = coords.length;
  x = x / total;
  y = y / total;
  z = z / total;
  
  const lngRad = Math.atan2(y, x);
  const hyp = Math.sqrt(x * x + y * y);
  const latRad = Math.atan2(z, hyp);
  
  return {
    lat: toDeg(latRad),
    lng: toDeg(lngRad)
  };
}

/**
 * Check if a point is within a bounding box
 */
export function isInBoundingBox(point: Coordinates, box: BoundingBox): boolean {
  return (
    point.lat >= box.sw.lat &&
    point.lat <= box.ne.lat &&
    point.lng >= box.sw.lng &&
    point.lng <= box.ne.lng
  );
}

/**
 * Generate a GeoJSON point feature
 */
export function toGeoJSONPoint(coord: Coordinates, properties: Record<string, any> = {}) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [coord.lng, coord.lat]
    },
    properties
  };
}

/**
 * Generate a GeoJSON feature collection from an array of points
 */
export function toGeoJSONFeatureCollection(points: Array<{coord: Coordinates; properties: Record<string, any>}>) {
  return {
    type: 'FeatureCollection',
    features: points.map(({coord, properties}) => toGeoJSONPoint(coord, properties))
  };
}
