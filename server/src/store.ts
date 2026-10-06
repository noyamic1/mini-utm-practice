import type { Alert, Drone, LatLng, Zone } from '../../shared/types';

/** Server-side drone: the public shape plus simulation internals clients don't need. */
export interface SimDrone extends Drone {
  route: LatLng[];
  waypointIndex: number;
}

// In-memory state. In production this would be a database plus a cache (e.g. Postgres + Redis).
export const drones = new Map<string, SimDrone>();
export const zones: Zone[] = [];
export const alerts: Alert[] = [];

const MAX_ALERTS = 200;

export function addAlert(alert: Alert) {
  alerts.unshift(alert); // newest first
  if (alerts.length > MAX_ALERTS) alerts.length = MAX_ALERTS;
}

/** Strip internal fields before anything leaves the server (a DTO). */
export function toPublic({ route, waypointIndex, ...pub }: SimDrone): Drone {
  return pub;
}
