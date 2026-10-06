import type { Server } from 'socket.io';
import type { Ack, ClientToServerEvents, ServerToClientEvents } from '../../shared/types';
import { bus } from './bus';
import { isValidLatLng } from './geo';
import { drones, toPublic } from './store';

export type IO = Server<ClientToServerEvents, ServerToClientEvents>;

const noop = (_res: Ack) => {};

/** The bridge between the internal event bus and the outside world (WebSocket clients). */
export function attachRealtime(io: IO) {
  // TASK 2a: forward domain events to every connected client.
  //   'telemetry'   -> 'fleet:update' (remember toPublic: never leak internal fields)
  //   'drone:moved' -> 'fleet:update'
  //   'alert'       -> 'alert:new'

  io.on('connection', (socket) => {
    console.log(`[ws] connected ${socket.id}`);

    // New clients get the full picture once, then only deltas.
    socket.emit('fleet:snapshot', [...drones.values()].map(toPublic));

    // TASK 2b: handle 'drone:reposition' (payload, ack)
    //   - validate: drone exists? position valid? (isValidLatLng). If not, ack({ ok: false, error })
    //   - apply: update position, set status to 'hold'
    //   - announce: emit 'drone:moved' on the bus
    //   - acknowledge: ack({ ok: true })
    // Think: should the client be allowed to move the drone in its own state directly?

    // TASK 2c: handle 'drone:resume' -> status back to 'flying', announce, acknowledge.

    socket.on('disconnect', (reason) => console.log(`[ws] disconnected ${socket.id} (${reason})`));
  });
}
