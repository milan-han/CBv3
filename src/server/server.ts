import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

app.use(express.static('public'));

interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
}

interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  heading: number;
}

const players: Record<string, PlayerState> = {};
const inputs: Record<string, InputState> = {};

io.on('connection', (socket) => {
  players[socket.id] = {
    x: Math.random() * 400 + 200,
    y: Math.random() * 300 + 150,
    vx: 0,
    vy: 0,
    heading: 0,
  };

  socket.on('input', (data: InputState) => {
    inputs[socket.id] = data;
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    delete inputs[socket.id];
  });
});

function step(dt: number) {
  for (const id of Object.keys(players)) {
    const player = players[id];
    const input = inputs[id];
    if (!player || !input) continue;

    const accel = 0.15;
    const maxSpeed = 6;
    const friction = 0.03;
    const turnSpeed = 0.05;

    if (input.up) {
      player.vx += Math.cos(player.heading) * accel;
      player.vy += Math.sin(player.heading) * accel;
    }
    if (input.down) {
      player.vx -= Math.cos(player.heading) * accel;
      player.vy -= Math.sin(player.heading) * accel;
    }
    if (input.left) {
      player.heading -= turnSpeed;
    }
    if (input.right) {
      player.heading += turnSpeed;
    }

    player.vx *= 1 - friction;
    player.vy *= 1 - friction;

    const speed = Math.hypot(player.vx, player.vy);
    if (speed > maxSpeed) {
      player.vx *= maxSpeed / speed;
      player.vy *= maxSpeed / speed;
    }

    player.x += player.vx;
    player.y += player.vy;
  }

  io.emit('state', players);
}

const TICK = 1000 / 60;
setInterval(() => step(TICK / 1000), TICK);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server listening on ${PORT}`));
