import { APIProvider } from '@vis.gl/react-google-maps';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LatLng, Zone } from '../../shared/types';
import { fetchZones } from './api';
import { FleetMap } from './components/FleetMap';
import { Sidebar } from './components/Sidebar';
import { useFleet } from './hooks/useFleet';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function App() {
  const { drones, alerts, connection, reposition, resume } = useFleet();
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Zones rarely change, so a one-time REST fetch is enough. Live data comes over the socket.
  useEffect(() => {
    fetchZones()
      .then(setZones)
      .catch(() => setNotice('Could not load zones. Check that the server is running on port 4000.'));
  }, []);

  const droneList = useMemo(
    () => Object.values(drones).sort((a, b) => a.callsign.localeCompare(b.callsign)),
    [drones],
  );

  const handleReposition = useCallback(
    async (id: string, position: LatLng) => {
      const res = await reposition(id, position);
      if (!res.ok) setNotice(`Move rejected: ${res.error ?? 'unknown error'}`);
      return res;
    },
    [reposition],
  );

  const handleResume = useCallback(
    async (id: string) => {
      const res = await resume(id);
      if (!res.ok) setNotice(`Could not resume: ${res.error ?? 'unknown error'}`);
    },
    [resume],
  );

  if (!API_KEY) {
    return (
      <div className="setup">
        <h1>Add a Google Maps key to start</h1>
        <p>
          Copy <code>client/.env.example</code> to <code>client/.env</code>, set <code>VITE_GOOGLE_MAPS_API_KEY</code>,
          then restart <code>npm run dev</code>.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="app">
        <Sidebar
          drones={droneList}
          zones={zones}
          alerts={alerts}
          connection={connection}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onResume={handleResume}
        />
        <main className="map-wrap">
          <FleetMap
            drones={droneList}
            zones={zones}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onReposition={handleReposition}
          />
          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button onClick={() => setNotice(null)}>Dismiss</button>
            </div>
          )}
        </main>
      </div>
    </APIProvider>
  );
}
