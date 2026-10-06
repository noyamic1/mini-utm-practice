import { bus } from './bus';
import { bearingDeg, distanceM } from './geo';
import { drones, type SimDrone } from './store';

export const TICK_MS = 1000;

/** Advance one drone toward its next waypoint. Linear lat/lng interpolation is fine at city scale. */
function step(d: SimDrone, dtSec: number) {
  const target = d.route[d.waypointIndex];
  const remaining = distanceM(d.position, target);
  const travel = d.speedMps * dtSec;

  d.headingDeg = Math.round(bearingDeg(d.position, target));

  if (remaining <= travel) {
    d.position = { ...target };
    d.waypointIndex = (d.waypointIndex + 1) % d.route.length;
  } else {
    const f = travel / remaining;
    d.position = {
      lat: d.position.lat + (target.lat - d.position.lat) * f,
      lng: d.position.lng + (target.lng - d.position.lng) * f,
    };
  }

  d.battery = Math.max(0, Math.round((d.battery - 0.05) * 100) / 100);
}

/** The producer: it only knows how to move drones and announce it. */
export function startSimulator() {
  return setInterval(() => {
    const moved: SimDrone[] = [];
    for (const d of drones.values()) {
      if (d.status !== 'flying') continue;
      step(d, TICK_MS / 1000);
      moved.push(d);
    }
    if (moved.length > 0) bus.emit('telemetry', moved);
  }, TICK_MS);
}
