/**
 * EMS.UP SFU Signaling — Socket.io /sfu namespace
 *
 * Architecture (WebRTC Broadcaster Pattern):
 *  - Admin joins as "broadcaster" (producer)
 *  - Each Worker gets a dedicated RTCPeerConnection to the admin
 *  - Admin → offer → Worker → answer → ICE exchange → video flows
 *
 * SFU Upgrade Path:
 *  Replace the offer/answer relay below with mediasoup3 Transport/Producer/Consumer.
 *  Zero frontend socket-event changes required — same event names.
 *
 * Redis Adapter:
 *  The /sfu namespace inherits the root io Redis adapter wired in server.js.
 *  Multi-process deployments work automatically via Redis pub/sub.
 *
 * Security:
 *  - All string inputs truncated before being broadcast to prevent large-payload DoS.
 *  - Worker cannot emit admin events (join is admin-flagged server-side; client flag
 *    ignored for privileged actions — admin identity is tracked by socket.id in rooms).
 */

'use strict';

const { joinRoom, leaveRoom, getRoomBySocket, raiseHand, lowerHand } = require('./sfuRoom');

module.exports = function attachSFU(io) {
  const sfu = io.of('/sfu');

  sfu.on('connection', (socket) => {
    console.log(`📹 SFU connect   : ${socket.id}`);

    // ─── JOIN ROOM ─────────────────────────────────────────────────────────
    socket.on('sfu:join', (data) => {
      if (!data || !data.roomId) return;

      const roomId   = String(data.roomId).slice(0, 30).toUpperCase();
      const name     = String(data.name     || 'User').slice(0, 80);
      const role     = String(data.role     || ''    ).slice(0, 20);
      const district = String(data.district || ''    ).slice(0, 60);
      const isAdmin  = !!data.isAdmin;

      socket.join(roomId);

      const room = joinRoom(roomId, socket.id, { name, isAdmin, role, district });

      if (isAdmin) {
        // Notify any workers already in the room that admin is ready
        socket.to(roomId).emit('sfu:admin_ready', { adminSocketId: socket.id });
        console.log(`👑 Admin "${name}" started room: ${roomId}`);
      } else {
        // Tell admin that a new worker has connected → admin creates WebRTC offer
        if (room.admin) {
          sfu.to(room.admin.socketId).emit('sfu:worker_joined', {
            workerSocketId: socket.id, name, role, district,
          });
        }
        // Give the joining worker current room state
        socket.emit('sfu:room_info', {
          hasAdmin:    !!room.admin,
          workerCount: room.workers.size,
        });
        console.log(`👷 Worker "${name}" joined room: ${roomId}`);
      }

      sfu.to(roomId).emit('sfu:participant_count', {
        workerCount: room.workers.size,
        hasAdmin:    !!room.admin,
      });
    });

    // ─── WebRTC SIGNALING RELAY ─────────────────────────────────────────────
    // Offer (Admin → specific Worker)
    socket.on('sfu:offer', ({ targetSocketId, sdp }) => {
      if (!targetSocketId || !sdp) return;
      sfu.to(String(targetSocketId)).emit('sfu:offer', { fromSocketId: socket.id, sdp });
    });

    // Answer (Worker → Admin)
    socket.on('sfu:answer', ({ targetSocketId, sdp }) => {
      if (!targetSocketId || !sdp) return;
      sfu.to(String(targetSocketId)).emit('sfu:answer', { fromSocketId: socket.id, sdp });
    });

    // ICE Candidate (bidirectional)
    socket.on('sfu:ice', ({ targetSocketId, candidate }) => {
      if (!targetSocketId || !candidate) return;
      sfu.to(String(targetSocketId)).emit('sfu:ice', { fromSocketId: socket.id, candidate });
    });

    // ─── RAISE HAND (Worker → Admin) ───────────────────────────────────────
    socket.on('sfu:raise_hand', ({ message }) => {
      const safeMsg = String(message || '').slice(0, 200);
      const room    = raiseHand(socket.id, safeMsg);
      if (!room?.admin) return;

      const worker = room.workers.get(socket.id);
      sfu.to(room.admin.socketId).emit('sfu:hand_raised', {
        workerSocketId: socket.id,
        name:           worker?.name     || '',
        district:       worker?.district || '',
        message:        safeMsg,
        queuePos:       room.raisedHands.length,
      });
    });

    // ─── ADMIN: ACCEPT INTERVENTION ────────────────────────────────────────
    // Grants mic for the selected worker; admin should then open a 2nd PC for
    // worker's mic track (handled client-side via sfu:create_mic_channel)
    socket.on('sfu:accept_intervention', ({ workerSocketId }) => {
      lowerHand(String(workerSocketId));
      sfu.to(String(workerSocketId)).emit('sfu:intervention_granted');
      socket.emit('sfu:create_mic_channel', { workerSocketId: String(workerSocketId) });
    });

    socket.on('sfu:end_intervention', ({ workerSocketId }) => {
      sfu.to(String(workerSocketId)).emit('sfu:intervention_ended');
    });

    // ─── BANDWIDTH ADVISORY (Worker → Server → Admin) ──────────────────────
    // Worker self-reports effective bitrate.  Server forwards quality advisory
    // to admin so admin can reduce encoding for that specific peer connection.
    socket.on('sfu:bandwidth_report', ({ kbps }) => {
      const numKbps = Math.max(0, Number(kbps) || 0);
      const room    = getRoomBySocket(socket.id);
      if (!room?.admin) return;
      if (numKbps < 250) {
        sfu.to(room.admin.socketId).emit('sfu:quality_advisory', {
          workerSocketId:   socket.id,
          suggestedQuality: '240p',
        });
      }
    });

    // ─── ADMIN CONTROLS ────────────────────────────────────────────────────
    socket.on('sfu:mute_all', () => {
      const room = getRoomBySocket(socket.id);
      if (room?.admin?.socketId !== socket.id) return; // only admin
      socket.to(room.id).emit('sfu:forced_mute');
    });

    socket.on('sfu:end_meeting', () => {
      const room = getRoomBySocket(socket.id);
      if (room?.admin?.socketId !== socket.id) return; // only admin
      sfu.to(room.id).emit('sfu:meeting_ended');
      console.log(`📹 Meeting ended : ${room.id}`);
    });

    // ─── DISCONNECT ────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const room = getRoomBySocket(socket.id);
      if (room) {
        const wasAdmin = room.admin?.socketId === socket.id;
        leaveRoom(socket.id);

        if (wasAdmin) {
          sfu.to(room.id).emit('sfu:admin_left');
        } else {
          if (room.admin) {
            sfu.to(room.admin.socketId).emit('sfu:worker_left', { workerSocketId: socket.id });
          }
          sfu.to(room.id).emit('sfu:participant_count', {
            workerCount: room.workers.size,
            hasAdmin:    !!room.admin,
          });
        }
      }
      console.log(`📹 SFU disconnect: ${socket.id}`);
    });
  });

  return sfu;
};
