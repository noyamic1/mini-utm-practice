import type { Alert, Drone, Zone } from '../../../shared/types';
import type { ConnectionState } from '../hooks/useFleet';

interface Props {
  drones: Drone[];
  zones: Zone[];
  alerts: Alert[];
  connection: ConnectionState;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onResume: (id: string) => void;
}

const CONNECTION_LABEL: Record<ConnectionState, string> = {
  connecting: 'Connecting',
  live: 'Live',
  offline: 'Offline, retrying',
};

const time = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export function Sidebar({ drones, zones, alerts, connection, selectedId, onSelect, onResume }: Props) {
  const zoneName = (id: string) => zones.find((z) => z.id === id)?.name ?? id;
  const flying = drones.filter((d) => d.status === 'flying').length;

  return (
    <aside className="panel">
      <header className="panel-head">
        <div>
          <h1>Tel Aviv airspace</h1>
          <p className="sub">
            {flying} flying, {drones.length - flying} holding
          </p>
        </div>
        <span className={`conn conn-${connection}`}>{CONNECTION_LABEL[connection]}</span>
      </header>

      <section aria-labelledby="fleet-h">
        <h2 id="fleet-h">Fleet</h2>
        <ul className="fleet">
          {drones.map((d) => {
            const breach = d.insideZones.length > 0;
            return (
              <li key={d.id}>
                <button className="drone-row" aria-pressed={d.id === selectedId} onClick={() => onSelect(d.id)}>
                  <span className="callsign">{d.callsign}</span>
                  <span className={`status ${breach ? 'status-breach' : d.status === 'hold' ? 'status-hold' : ''}`}>
                    {breach ? `In ${zoneName(d.insideZones[0])}` : d.status === 'hold' ? 'Holding' : 'On mission'}
                  </span>
                  <span className="metrics">
                    <span>{d.altitudeM} m</span>
                    <span>{d.status === 'flying' ? d.speedMps : 0} m/s</span>
                    <span>{d.headingDeg}°</span>
                    <span>{Math.round(d.battery)}%</span>
                  </span>
                  <span className="battery" aria-hidden="true">
                    <span style={{ width: `${d.battery}%` }} />
                  </span>
                </button>
                {d.status === 'hold' && (
                  <button className="resume" onClick={() => onResume(d.id)}>
                    Resume mission
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="alerts-h">
        <h2 id="alerts-h">Alerts</h2>
        {alerts.length === 0 ? (
          <p className="empty">No alerts yet. Drag a drone into a shaded zone to trigger one.</p>
        ) : (
          <ol className="alerts" aria-live="polite">
            {alerts.map((a) => (
              <li key={a.id} className={a.type === 'zone:enter' ? 'alert-enter' : 'alert-exit'}>
                <time dateTime={new Date(a.at).toISOString()}>{time(a.at)}</time>
                <span className="msg">{a.message}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </aside>
  );
}
