# High Lander interview prep

Assessment day: **Thursday 8.10.26, 12:00–18:00**. Arrive a few minutes before 12:00.
Format: get to know the team, a hands-on assignment (with AI tools, via a private GitHub repo),
then a technical interview about your assignment and an HR interview.

---

## 1. The night before: checklist

**Bring:** laptop, charger, your own food for the day.

**On the laptop, verified working, not just installed:**

- [ ] Node LTS: `node -v` (20 or 22) and `npm -v`
- [ ] Git: `git --version`, and identity set:
      `git config --global user.name "Noya ..."` and `git config --global user.email "..."`
- [ ] GitHub access from the terminal. Test it by cloning one of your own **private** repos.
      Easiest is the GitHub CLI: `gh auth login`, then `gh repo clone owner/repo`.
      (HTTPS needs a personal access token as the password; SSH needs a key added to GitHub: `ssh -T git@github.com`.)
- [ ] VS Code with the extensions you'll want (ESLint, Prettier, your AI extension)
- [ ] Your AI tools logged in and working: Claude Code in the terminal or VS Code, claude.ai in the browser
- [ ] A Google Maps key that works. This repo running end to end is the test.
- [ ] Phone hotspot as a backup in case the Wi-Fi is bad

---

## 2. Git flow you'll do on the day

They'll give you access to a private repo. Practice this exact sequence with this project until it's boring.

```bash
# get the repo
gh repo clone highlander-org/assignment-noya      # or: git clone <url>
cd assignment-noya

# look before you touch
git log --oneline -5
git branch -a

# work on a branch
git switch -c feature/live-tracking

# commit in small steps, with messages that say what changed
git add -p                                        # review each hunk before staging
git commit -m "Add edge-triggered geofence evaluation"

# push and open a PR
git push -u origin feature/live-tracking
gh pr create --fill                               # or open it on github.com
```

Useful when something goes wrong:

| Situation | Command |
|---|---|
| What did I change? | `git status`, `git diff` |
| Undo changes to one file | `git restore path/to/file` |
| Unstage a file | `git restore --staged path/to/file` |
| Fix the last commit message | `git commit --amend` (only before pushing) |
| Park work to switch branches | `git stash`, later `git stash pop` |
| Get the latest from remote | `git pull --rebase` |

### Practise this repo as if it were theirs

1. Unzip, `cd mini-utm`, and create an **empty private repo** on GitHub (no README).
2. `git remote add origin <url>` then `git push -u origin --all` (pushes `main` and `solution`).
3. Delete the local folder. Clone it fresh. That is your rehearsal of the first five minutes.
4. `git switch -c feature/tasks`, do the tasks, commit, push, open a PR into `main`.
5. Time yourself. Aim to finish tasks 1–4 well under 2 hours.

---

## 3. Concepts to be able to explain

### Client–server and full stack

The **server** owns the truth (drone positions, zones, alerts). The **client** displays it and sends
*intents* ("please move this drone"). The server validates, applies, and tells everyone.
Never let the client decide the state; another tab, another operator, or a bad request would break it.

**REST** (HTTP request/response) is for: initial loads, things that change rarely (zones), history (alerts).
**WebSocket** is for: things that change constantly and must be pushed (telemetry, alerts as they happen).

### Ways to get real-time data to a browser

| Technique | How it works | When it fits |
|---|---|---|
| Polling | Client asks every N seconds | Simple, data changes slowly, small scale |
| Long polling | Request stays open until there's news | Fallback when WebSockets are blocked |
| SSE (Server-Sent Events) | One-way stream server to client over HTTP | Feeds and dashboards with no client-to-server messages |
| WebSocket | Persistent two-way connection | Live maps, chat, control: anything two-way and frequent |

**Socket.IO** is a library on top of WebSocket that adds: automatic reconnection, a fallback to
long polling, named events, acknowledgements (request/response over the socket), rooms, and
broadcasting. In this project:

- `io.emit(...)` sends to everyone. `socket.emit(...)` sends to one client.
- `socket.timeout(3000).emitWithAck(...)` on the client returns a Promise of the server's reply.
- **Rooms** (`socket.join('zone:z-ichilov')`, then `io.to(room).emit(...)`) let you send only to
  interested clients. Be ready to say how you'd use them: per operator, per region, per mission.

### Event-driven architecture

Components communicate by **emitting events** rather than calling each other directly.

- **Producer**: announces something happened (`simulator` emits `telemetry`).
- **Consumer**: reacts (`geofence` listens to `telemetry`, emits `zone:enter`).
- **Bus/broker**: carries events. Here: Node's `EventEmitter`, in one process.

Why it's good: you can add a new behaviour (email on breach, logging, metrics) by adding a subscriber,
without touching the simulator or the geofence. Producers don't know who listens.

What it costs: the flow is harder to follow, ordering matters (see `index.ts`), and errors in one
listener can affect others. Debugging needs good logs.

**Scaling it:** `EventEmitter` only works inside one process. With several server instances you'd use
a real broker: **Redis pub/sub** (plus the Socket.IO Redis adapter so `io.emit` reaches clients on
every instance), **Kafka** (durable, replayable streams, high volume), or **MQTT** (lightweight,
designed for devices).

### M2M and MQTT

M2M (machine to machine) means devices talking to systems without a human in the loop, which is
exactly drones sending telemetry. **MQTT** is the classic M2M protocol: tiny messages, publish/subscribe
via a broker, topics like `fleet/HL-01/telemetry`, and QoS levels (0 = at most once,
1 = at least once, 2 = exactly once). A realistic pipeline: drone → MQTT broker → ingest service →
event bus → geofence/alerts → WebSocket → dashboard.

### Edge-triggered vs level-triggered

- **Level**: "the drone is inside" (true on every tick).
- **Edge**: "the drone just entered" (true once, on the transition).

Alerts must be edge-triggered or you'd send one per second. The trick: store the previous state
(`insideZones`) and compare.

### Snapshot + deltas

On connect, the server sends the full state once (`fleet:snapshot`), then only what changed
(`fleet:update`). The client merges deltas by id. This is cheaper than resending everything and
handles reconnects naturally: after a reconnect you get a fresh snapshot.

### React points that come up in this project

- **Functional state updates** (`setDrones(prev => ...)`) inside socket listeners. The listener is
  created once inside `useEffect(..., [])`, so it captures the first value of `drones`. Using `prev`
  always gives the latest. That's the stale closure problem you studied.
- **Effect cleanup** disconnects the socket. In dev, `StrictMode` mounts twice on purpose, so
  without cleanup you'd have two connections and double events.
- **State keyed by id** (`Record<string, Drone>`) makes merges O(1) and avoids duplicates.
- **`key` in lists**: use the stable `d.id`, never the array index, or React mixes up markers.
- **`useMemo` / `useCallback`**: avoid recomputing the sorted list and recreating handlers each render.
- **Custom hook** (`useFleet`) keeps networking out of components. Components just render.

### Optimistic UI and rollback

When you drop a drone, show it at the new spot immediately, then wait for the server's ack.
If the server rejects it, snap back. In `FleetMap` that's the `pinned` state.
The same idea also fixes the drag bug: while dragging, ignore live positions for that one drone.

### Google Maps in React

- `@vis.gl/react-google-maps` is Google's official React wrapper.
- `<APIProvider apiKey>` loads the script once. `<Map>` needs a `mapId` for **advanced markers**
  (`DEMO_MAP_ID` works for development).
- `<AdvancedMarker position draggable onDragEnd>` renders any React content as a marker.
- Things with no React component (polygons, polylines, heatmaps) you create imperatively with
  `useMap()` in a `useEffect`, and remove in its cleanup (see `ZonePolygon.tsx`).
- `defaultCenter` vs `center`: default = uncontrolled (user can pan), `center` = controlled by state.
- Other APIs you might be handed: **Geocoding** (address to coordinates), **Directions** (routes),
  **Places**, **Distance Matrix**. Know what each does.
- Keys: restrict them by HTTP referrer and by API in the Cloud Console. A browser key is visible to
  anyone, so restriction is the protection, not secrecy.

### Geo basics

- Coordinates are `{ lat, lng }`. In GeoJSON the order is `[lng, lat]`: a classic bug.
- **Haversine** gives distance on a sphere (`geo.ts`).
- **Point in polygon** with ray casting: count edge crossings, odd = inside.
- For production: **Turf.js** in JS, or **PostGIS** in Postgres for spatial queries at scale.

### Validation and security

Never trust the client: validate every payload on the server (`isValidLatLng`). In a real system:
authenticate the socket (token on connect), authorise per action (can this operator move this drone?),
and rate-limit.

### Project structure

```
shared/   contract (types) used by both sides
server/   routes (REST) · realtime (sockets) · domain services (simulator, geofence, alerts) · store
client/   api (fetch) · hooks (state + socket) · components (UI only)
```

Rule of thumb to say out loud: *transport* (HTTP, WebSocket) is separate from *domain logic*
(geofencing), which is separate from *state* (store). You could swap Socket.IO for SSE without
touching the geofence.

---

## 4. The company, in one paragraph

High Lander is an Israeli company building software for drone operations. **Vega UTM** manages
airspace: it monitors flights in real time, approves or denies flight plans, and handles
deconfliction. It was the first UTM licensed by the Civil Aviation Authority of Israel after
continuous broadcasting to a UTM became mandatory. **Orion DFM** (drone fleet management) plans and
automates multi-drone missions. Customers include police, delivery and security operators.

Vocabulary worth using naturally: **UTM**, **DFM**, **telemetry**, **geofence**, **NFZ** (no-fly zone),
**flight plan**, **deconfliction** (keeping aircraft apart, strategically before flight and tactically
during it), **BVLOS** (beyond visual line of sight), **Remote ID**.

---

## 5. Working with AI on the day

They want to *see how you use* AI, so make your process visible and deliberate.

1. **Read the brief and the repo first** (10 min). Run it. Understand the structure before prompting.
2. **Plan out loud**: write a short plan in the README or a `NOTES.md`. Ask the AI to critique the plan, not to write everything.
3. **Small, specific prompts** with context: the file, the contract, the constraint.
   "In `realtime.ts`, handle `drone:reposition`: validate with `isValidLatLng`, set status to hold, emit `drone:moved`, ack. Don't change other files."
4. **Read every diff before accepting it.** Run it. If you can't explain a line, ask the AI to explain it, or rewrite it.
5. **Commit after each working step.** Your commit history tells the story of how you worked.
6. **Don't let the AI add dependencies or restructure** the project unless you decided to.
7. Leave 15 minutes at the end: clean up, update the README (how to run, what you did, what you'd do next), push.

---

## 6. Likely technical-interview questions

Practise answering these about **your** code, in 1–2 minutes each.

1. Walk me through what happens from the moment a drone moves on the server until it moves on the screen.
2. Why WebSocket and not polling? When would polling actually be the better choice?
3. What happens if the connection drops for 10 seconds? How does the client recover?
4. Why does the server decide the drone's position, and not the client?
5. How would you scale this to 10,000 drones and 500 operators? (batching, throttling, rooms per region, broker, multiple instances, Redis adapter)
6. The UI is slow with many markers. What would you check? (re-renders, memo, marker clustering, update rate)
7. How do you avoid sending an alert every second while a drone stays in a zone?
8. Two operators drag the same drone at the same time. What happens? How would you handle it? (server is the single writer, last write wins, or locks or versioning)
9. What would you test first, and how?
10. What would you improve with another day?

---

## 7. A timeboxed plan for 2 hours

| Time | What |
|---|---|
| 0:00–0:10 | Clone, install, run. Read the brief and skim the structure. |
| 0:10–0:20 | Plan: data model, events, endpoints, what goes where. Write it down. |
| 0:20–1:20 | Build in vertical slices: server event → socket → client state → UI. Commit each slice. |
| 1:20–1:40 | Edge cases: reconnects, invalid input, empty states, errors shown to the user. |
| 1:40–2:00 | README, cleanup, final run from a clean clone, push, PR. |

If you fall behind, cut scope, not quality. A smaller thing that works and that you can explain beats a big thing that half works.
