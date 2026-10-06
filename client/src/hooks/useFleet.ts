import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { Ack, Alert, ClientToServerEvents, Drone, LatLng, ServerToClientEvents } from '../../../shared/types';
import { fetchAlerts } from '../api';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
export type ConnectionState = 'connecting' | 'live' | 'offline';

const MAX_ALERTS = 50;
const ACK_TIMEOUT_MS = 3000;

/** Merge two alert lists by id, newest first. Handles history arriving after live alerts. */
function mergeAlerts(a: Alert[], b: Alert[]): Alert[] {
  const byId = new Map<string, Alert>();
  for (const alert of [...a, ...b]) byId.set(alert.id, alert);
  return [...byId.values()].sort((x, y) => y.at - x.at).slice(0, MAX_ALERTS);
}

/** Owns the socket connection and the live fleet state. Components only read from it. */
export function useFleet() {
  // Record keyed by id: O(1) updates and no duplicates when deltas arrive.
  const [drones, setDrones] = useState<Record<string, Drone>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connection, setConnection] = useState<ConnectionState>('connecting');
  const socketRef = useRef<AppSocket | null>(null);

  useEffect(() => {
    const socket: AppSocket = io(); // same origin; Vite proxies /socket.io
    socketRef.current = socket;

    socket.on('connect', () => setConnection('live'));
    socket.on('disconnect', () => setConnection('offline'));

    socket.on('fleet:snapshot', (list) => {
      setDrones(Object.fromEntries(list.map((d) => [d.id, d])));
    });

    // TASK 3a: listen to 'fleet:update' and merge the changed drones into state.
    // Careful: `drones` inside this effect is frozen at its first value (stale closure).

    // TASK 3b: listen to 'alert:new' and add the alert to the list (use mergeAlerts).

    // Cleanup: StrictMode mounts twice in dev, and without this you'd hold two connections.
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchAlerts()
      .then((history) => {
        if (!cancelled) setAlerts((prev) => mergeAlerts(prev, history));
      })
      .catch((err) => console.error('Could not load alert history', err));
    return () => {
      cancelled = true;
    };
  }, []);

  // TASK 3c: send intents to the server and wait for its acknowledgement.
  // Hint: socket.timeout(ms).emitWithAck(event, payload) returns a Promise of the Ack.
  // Handle: not connected, and no answer in time.
  const reposition = useCallback(async (_droneId: string, _position: LatLng): Promise<Ack> => {
    return { ok: false, error: 'Not implemented yet' };
  }, []);

  const resume = useCallback(async (_droneId: string): Promise<Ack> => {
    return { ok: false, error: 'Not implemented yet' };
  }, []);

  return { drones, alerts, connection, reposition, resume };
}
