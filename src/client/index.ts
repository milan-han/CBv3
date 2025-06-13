import io from 'socket.io-client';

const socket = io();

const input = {
  up: false,
  down: false,
  left: false,
  right: false,
  brake: false,
};

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyW') input.up = true;
  if (e.code === 'KeyS') input.down = true;
  if (e.code === 'KeyA') input.left = true;
  if (e.code === 'KeyD') input.right = true;
  if (e.code === 'Space') input.brake = true;
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW') input.up = false;
  if (e.code === 'KeyS') input.down = false;
  if (e.code === 'KeyA') input.left = false;
  if (e.code === 'KeyD') input.right = false;
  if (e.code === 'Space') input.brake = false;
});

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

interface PlayerState {
  x: number;
  y: number;
  heading: number;
}

let state: Record<string, PlayerState> = {};

socket.on('state', (s: Record<string, PlayerState>) => {
  state = s;
});

function sendInput() {
  socket.emit('input', input);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  Object.values(state).forEach((p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.heading);
    ctx.fillStyle = '#c62828';
    ctx.fillRect(-7, -12, 14, 24);
    ctx.restore();
  });
}

function loop() {
  sendInput();
  draw();
  requestAnimationFrame(loop);
}

loop();
