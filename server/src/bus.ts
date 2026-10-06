import { EventEmitter } from 'node:events';
import type { Alert, Zone } from '../../shared/types';
import type { SimDrone } from './store';

/**
 * Domain events inside the server.
 * Producers emit, consumers subscribe, and neither imports the other.
 * That decoupling is the core of an event-driven design.
 */
export interface DomainEvents {
  telemetry: [drones: SimDrone[]]; // simulator tick: these drones moved
  'drone:moved': [drone: SimDrone]; // a client repositioned or resumed a drone
  'zone:enter': [drone: SimDrone, zone: Zone];
  'zone:exit': [drone: SimDrone, zone: Zone];
  alert: [alert: Alert];
}

export const bus = new EventEmitter<DomainEvents>();
