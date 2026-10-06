# Mini UTM: practice assignment

A small airspace-monitoring system in the spirit of a UTM (uncrewed traffic management) platform.
A server simulates drones flying over Tel Aviv and streams their positions in real time.
A React dashboard shows them on Google Maps, together with no-fly zones and a live alert feed.

**Timebox: 2 hours.** Use any AI tool you like, but you must be able to explain every line you submit.

## Run it

Requirements: Node 20+ (`node -v`), a Google Maps JavaScript API key.

```bash
npm run setup                          # installs root, server and client
cp client/.env.example client/.env     # then paste your key into client/.env
npm run dev                            # server on :4000, client on :5173
```

Open http://localhost:5173. In the starter you should see the map, the zones and four frozen drones.

## Architecture

```
 server
 ───────────────────────────────────────────────────────────
  simulator  ── emits telemetry every second
      │
      ▼
  bus (EventEmitter)
      ├─ geofence   telemetry, drone:moved  →  zone:enter / zone:exit
      ├─ alerts     zone:enter / zone:exit  →  alert
      └─ realtime   telemetry, alert        →  socket.emit to all clients
  routes            GET /api/zones, /api/alerts, /api/drones
 ───────────────────────────────────────────────────────────
        │ fleet:snapshot, fleet:update,      ▲ drone:reposition,
        │ alert:new (server → client)        │ drone:resume (client → server, with ack)
        ▼                                    │
 client
  useFleet   owns the socket and the live state
  FleetMap   Google Map, zones, draggable drones
  Sidebar    fleet list and alert feed
  api.ts     one-time REST fetches

 shared/types.ts is the contract both sides import.
```

## Tasks

Work in order. Each one is small; together they make the system live.

1. **Geofencing** (`server/src/geo.ts`, `server/src/geofence.ts`)
   Implement `pointInPolygon` (tests: `npm --prefix server test`), then `evaluateGeofences`,
   which emits `zone:enter` / `zone:exit` only when a drone's inside/outside state changes.

2. **Realtime bridge** (`server/src/realtime.ts`)
   Forward bus events to all clients, and handle the `drone:reposition` and `drone:resume`
   intents with validation and an acknowledgement.

3. **Live client** (`client/src/hooks/useFleet.ts`)
   Merge `fleet:update` deltas into state, append `alert:new`, and send intents with `emitWithAck`.

4. **Drag to reposition** (`client/src/components/FleetMap.tsx`)
   Make markers draggable and send the drop point to the server. Find and fix the bug where
   live updates fight with an in-progress drag.

**Done when:** drones move, dragging one into a shaded zone turns it and the zone magenta,
an alert appears, and the drone holds until you click "Resume mission".

## Stretch goals

- `POST /api/zones` to create a zone, broadcast `zones:update`, and draw it on the map.
- Send only drones whose position actually changed, or throttle updates to N per second.
- Show each drone's trail (last 30 positions) as a polyline.
- A "Return to base" command.
- Two browser tabs open: does a drag in one show up in the other? Why?

## Submit

Work on a branch, commit in small steps with clear messages, push, and open a pull request.
A reference solution lives on the `solution` branch. Don't look until you're done.
