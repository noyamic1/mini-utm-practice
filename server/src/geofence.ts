import { bus } from './bus';
import { pointInPolygon } from './geo';
import { zones, type SimDrone } from './store';

/**
 * TASK 1b: for every zone, decide whether the drone is inside it.
 * Emit 'zone:enter' / 'zone:exit' on the bus, but ONLY when the state changes
 * (the drone was outside and is now inside, or the reverse). Keep d.insideZones up to date.
 * Ask yourself: what goes wrong if you emit on every tick instead?
 */
export function evaluateGeofences(d: SimDrone) {
  // TODO
}

/** A consumer of movement events, and a producer of zone events. */
export function startGeofenceService() {
  bus.on('telemetry', (moved) => moved.forEach(evaluateGeofences));
  bus.on('drone:moved', evaluateGeofences);
}
