import type { LatLng, Zone } from '../../shared/types';
import { drones, zones, type SimDrone } from './store';

const P = (lat: number, lng: number): LatLng => ({ lat, lng });

const ZONES: Zone[] = [
  {
    id: 'z-ichilov',
    name: 'Ichilov helipad',
    kind: 'no-fly',
    polygon: [P(32.0825, 34.7865), P(32.0825, 34.7925), P(32.0785, 34.7925), P(32.0785, 34.7865)],
  },
  {
    id: 'z-azrieli',
    name: 'Azrieli towers',
    kind: 'no-fly',
    polygon: [P(32.076, 34.79), P(32.076, 34.7945), P(32.0728, 34.7945), P(32.0728, 34.79)],
  },
  {
    id: 'z-reading',
    name: 'Reading power station',
    kind: 'restricted',
    polygon: [P(32.1065, 34.774), P(32.1065, 34.7825), P(32.101, 34.783), P(32.1005, 34.7745)],
  },
];

type Seed = Pick<SimDrone, 'id' | 'callsign' | 'speedMps' | 'altitudeM' | 'route'>;

// Routes loop forever. Some deliberately cross zones so alerts happen without any interaction.
const DRONES: Seed[] = [
  { id: 'd1', callsign: 'HL-01', speedMps: 40, altitudeM: 90, route: [P(32.054, 34.7515), P(32.064, 34.774), P(32.0805, 34.7895), P(32.0725, 34.779)] },
  { id: 'd2', callsign: 'HL-02', speedMps: 35, altitudeM: 110, route: [P(32.0975, 34.7735), P(32.1035, 34.7785), P(32.111, 34.799), P(32.099, 34.795)] },
  { id: 'd3', callsign: 'HL-03', speedMps: 30, altitudeM: 75, route: [P(32.072, 34.7865), P(32.0745, 34.7925), P(32.073, 34.799), P(32.0755, 34.7745)] },
  { id: 'd4', callsign: 'HL-04', speedMps: 45, altitudeM: 60, route: [P(32.065, 34.763), P(32.085, 34.77), P(32.09, 34.772), P(32.07, 34.765)] },
];

export function seed() {
  zones.push(...ZONES);
  for (const s of DRONES) {
    drones.set(s.id, {
      ...s,
      position: { ...s.route[0] },
      waypointIndex: 1,
      headingDeg: 0,
      battery: 100,
      status: 'flying',
      insideZones: [],
    });
  }
}
