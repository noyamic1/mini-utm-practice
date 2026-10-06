import { AdvancedMarker, Map } from '@vis.gl/react-google-maps';
import { useMemo } from 'react';
import type { Ack, Drone, LatLng, Zone } from '../../../shared/types';
import { DroneGlyph } from './DroneGlyph';
import { ZonePolygon } from './ZonePolygon';

const TEL_AVIV: LatLng = { lat: 32.0809, lng: 34.7806 };
const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

interface Props {
  drones: Drone[];
  zones: Zone[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReposition: (id: string, position: LatLng) => Promise<Ack>;
}

export function FleetMap({ drones, zones, selectedId, onSelect, onReposition }: Props) {
  const activeZoneIds = useMemo(() => new Set(drones.flatMap((d) => d.insideZones)), [drones]);

  // TASK 4: make drones draggable.
  //   - On drop, call onReposition(id, { lat, lng }) with the new coordinates.
  //   - Bug to find and fix: telemetry ticks every second. What happens to a marker
  //     you're dragging when a new position arrives mid-drag? How do you prevent it?
  //   - Bonus: show the drone at the drop point right away (optimistic UI), and snap it
  //     back if the server rejects the move.

  return (
    <Map
      className="map"
      defaultCenter={TEL_AVIV}
      defaultZoom={13}
      mapId={MAP_ID}
      gestureHandling="greedy"
      disableDefaultUI
      clickableIcons={false}
    >
      {zones.map((z) => (
        <ZonePolygon key={z.id} zone={z} active={activeZoneIds.has(z.id)} />
      ))}

      {drones.map((d) => (
        <AdvancedMarker
          key={d.id}
          position={d.position}
          title={d.callsign}
          onClick={() => onSelect(d.id)}
        >
          <DroneGlyph drone={d} selected={d.id === selectedId} />
        </AdvancedMarker>
      ))}
    </Map>
  );
}
