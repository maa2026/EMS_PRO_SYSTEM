/**
 * EMS.UP SFU Room State Manager
 *
 * In-memory room registry for Video Conferencing Cluster.
 * Rooms auto-delete when admin + all workers disconnect.
 *
 * Scale note: For multi-process deployments, migrate these Maps to Redis
 * hashes (already available via ioredis) — zero frontend changes needed.
 */

'use strict';

const rooms = new Map(); // roomId → Room object

/**
 * @typedef {{ socketId: string, name: string, role: string, district: string }} AdminMeta
 * @typedef {{ socketId: string, name: string, role: string, district: string, raisedHand: boolean }} WorkerMeta
 * @typedef {{ id: string, admin: AdminMeta|null, workers: Map<string,WorkerMeta>, raisedHands: Array, active: boolean, startedAt: number }} Room
 */

function createOrGetRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id:          roomId,
      admin:       null,
      workers:     new Map(),   // socketId → WorkerMeta
      raisedHands: [],          // [{socketId, name, district, message}] — ordered queue
      active:      true,
      startedAt:   Date.now(),
    });
  }
  return rooms.get(roomId);
}

function joinRoom(roomId, socketId, { name, isAdmin, role, district }) {
  const room = createOrGetRoom(roomId);
  if (isAdmin) {
    room.admin  = { socketId, name, role, district };
    room.active = true;
  } else {
    room.workers.set(socketId, { socketId, name, role, district, raisedHand: false });
  }
  return room;
}

function leaveRoom(socketId) {
  for (const [roomId, room] of rooms.entries()) {
    if (room.admin?.socketId === socketId) {
      room.admin  = null;
      room.active = false;
    }
    if (room.workers.has(socketId)) {
      room.workers.delete(socketId);
      room.raisedHands = room.raisedHands.filter(h => h.socketId !== socketId);
    }
    // GC empty rooms
    if (!room.admin && room.workers.size === 0) {
      rooms.delete(roomId);
    }
  }
}

function getRoomBySocket(socketId) {
  for (const room of rooms.values()) {
    if (room.admin?.socketId === socketId) return room;
    if (room.workers.has(socketId))        return room;
  }
  return null;
}

function raiseHand(socketId, message) {
  const room = getRoomBySocket(socketId);
  if (!room) return null;
  const worker = room.workers.get(socketId);
  if (!worker) return null;
  // Deduplicate — one hand entry per worker
  room.raisedHands = room.raisedHands.filter(h => h.socketId !== socketId);
  room.raisedHands.push({ socketId, name: worker.name, district: worker.district, message });
  worker.raisedHand = true;
  return room;
}

function lowerHand(socketId) {
  const room = getRoomBySocket(socketId);
  if (!room) return;
  const worker = room.workers.get(socketId);
  if (worker) worker.raisedHand = false;
  room.raisedHands = room.raisedHands.filter(h => h.socketId !== socketId);
}

module.exports = { createOrGetRoom, joinRoom, leaveRoom, getRoomBySocket, raiseHand, lowerHand };
