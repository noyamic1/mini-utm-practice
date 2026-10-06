import { useMap } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';
import type { Zone } from '../../../shared/types';

const STYLE = {
  'no-fly': { color: '#A51C6E' },
  restricted: { color: '#2F5C8A' },
} as const;

/**
 * The library has no <Polygon> component, so we drive the imperative Maps API from an effect.
 * Pattern: create on mount, sync on prop change, remove in cleanup. Renders nothing itself.
 */
export function ZonePolygon({ zone, active }: { zone: Zone; active: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const { color } = STYLE[zone.kind];
    const polygon = new google.maps.Polygon({
      map,
      paths: zone.polygon,
      clickable: false,
      strokeColor: color,
      strokeWeight: active ? 3 : 1.5,
      fillColor: color,
      fillOpacity: active ? 0.35 : 0.12,
    });
    return () => polygon.setMap(null);
  }, [map, zone, active]);

  return null;
}
