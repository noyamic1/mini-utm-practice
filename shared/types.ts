// The contract between server and client.
// Type-only: both sides use `import type`, so nothing here exists at runtime.

export interface LatLng {
  lat: number;
  lng: number;
}

export type DroneStatus = 'flying' | 'hold';

/** What clients see. The server keeps extra internal fields (route, waypoint). */
export interface Drone {
  id: string;
  callsign: string;
  position: LatLng;
  headingDeg: number;
  speedMps: number;
  altitudeM: number;
  battery: number; // 0-100
  status: DroneStatus;
  insideZones: string[]; // ids of zones the drone is currently inside
}

export type ZoneKind = 'no-fly' | 'restricted';

export interface Zone {
  id: string;
  name: string;
  kind: ZoneKind;
  polygon: LatLng[];
}

export type AlertType = 'zone:enter' | 'zone:exit';

export interface Alert {
  id: string;
  type: AlertType;
  droneId: string;
  zoneId: string;
  message: string;
  at: number; // epoch ms
}

/** Reply the server sends back through a Socket.IO acknowledgement. */
export interface Ack {
  ok: boolean;
  error?: string;
}

/** Events the server pushes to clients. */
export interface ServerToClientEvents {
  'fleet:snapshot': (drones: Drone[]) => void; // full state, once, on connect
  'fleet:update': (drones: Drone[]) => void; // only the drones that changed
  'alert:new': (alert: Alert) => void;
}

/** Intents clients send to the server. The server decides; clients never mutate state directly. */
export interface ClientToServerEvents {
  'drone:reposition': (payload: { droneId: string; position: LatLng }, ack: (res: Ack) => void) => void;
  'drone:resume': (payload: { droneId: string }, ack: (res: Ack) => void) => void;
}
