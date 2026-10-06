import cors from 'cors';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { startAlertService } from './alerts';
import { startGeofenceService } from './geofence';
import { attachRealtime, type IO } from './realtime';
import { api } from './routes';
import { seed } from './seed';
import { startSimulator } from './simulator';

const PORT = Number(process.env.PORT ?? 4000);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', api);

// Express and Socket.IO share one HTTP server, so one port serves REST and WebSocket.
const httpServer = createServer(app);
const io: IO = new Server(httpServer, { cors: { origin: '*' } });

seed();

// Order matters: EventEmitter calls listeners in subscription order.
// Geofencing must update insideZones BEFORE the realtime bridge broadcasts the drone.
startGeofenceService();
startAlertService();
attachRealtime(io);
startSimulator();

httpServer.listen(PORT, () => console.log(`API + WebSocket on http://localhost:${PORT}`));
