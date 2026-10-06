import { Router } from 'express';
import { alerts, drones, toPublic, zones } from './store';

/** REST is for request/response reads. Live changes go over the WebSocket. */
export const api = Router();

api.get('/health', (_req, res) => res.json({ ok: true, uptimeSec: Math.round(process.uptime()) }));
api.get('/drones', (_req, res) => res.json([...drones.values()].map(toPublic)));
api.get('/zones', (_req, res) => res.json(zones));
api.get('/alerts', (_req, res) => res.json(alerts));
