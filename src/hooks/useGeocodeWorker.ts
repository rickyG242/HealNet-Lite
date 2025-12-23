import { useEffect } from 'react';
import { geocodeWorker } from '../workers/geocodeWorker';

/**
 * Hook to manage the geocoding worker lifecycle
 * Starts the worker when the component mounts and stops it when unmounting
 * @param enabled Whether the worker should be enabled (default: true)
 */
export function useGeocodeWorker(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    
    // Start the worker when the component mounts
    geocodeWorker.start().catch(error => {
      console.error('Failed to start geocode worker:', error);
    });
    
    // Clean up the worker when the component unmounts
    return () => {
      geocodeWorker.stop();
    };
  }, [enabled]);
  
  return geocodeWorker;
}

export default useGeocodeWorker;
