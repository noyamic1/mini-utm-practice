import type { Drone } from '../../../shared/types';

export function DroneGlyph({ drone, selected }: { drone: Drone; selected: boolean }) {
  const className = [
    'drone',
    drone.insideZones.length > 0 && 'is-breach',
    drone.status === 'hold' && 'is-hold',
    selected && 'is-selected',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      <svg viewBox="0 0 24 24" style={{ transform: `rotate(${drone.headingDeg}deg)` }} aria-hidden="true">
        <path d="M12 2 L19.5 21 L12 16.5 L4.5 21 Z" />
      </svg>
      <span className="drone-label">{drone.callsign}</span>
    </div>
  );
}
