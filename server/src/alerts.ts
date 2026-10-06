import type { Alert, AlertType, Zone } from '../../shared/types';
import { bus } from './bus';
import { addAlert, type SimDrone } from './store';

let seq = 0;

function makeAlert(type: AlertType, d: SimDrone, z: Zone): Alert {
  const verb = type === 'zone:enter' ? 'entered' : 'left';
  return {
    id: `al-${Date.now()}-${++seq}`,
    type,
    droneId: d.id,
    zoneId: z.id,
    message: `${d.callsign} ${verb} ${z.name}`,
    at: Date.now(),
  };
}

/** Turns zone events into stored alerts. Adding email/SMS later = one more subscriber, no other changes. */
export function startAlertService() {
  bus.on('zone:enter', (d, z) => {
    const alert = makeAlert('zone:enter', d, z);
    addAlert(alert);
    bus.emit('alert', alert);
  });
  bus.on('zone:exit', (d, z) => {
    const alert = makeAlert('zone:exit', d, z);
    addAlert(alert);
    bus.emit('alert', alert);
  });
}
