# Car Ball.io

This is a simple multiplayer browser game. The server is built with Node.js and Socket.io while the client is written in TypeScript.

## Local Development

1. Install dependencies
   ```bash
   npm install
   ```
2. Build the project
   ```bash
   npm run build
   ```
3. Start the server
   ```bash
   npm start
   ```
4. Open `http://localhost:3000` in two browser windows to test a match.

## Deployment

The app can be deployed to Render using two services:

- **static-site** – serves the compiled client in the `public` folder.
- **web-service** – runs `node dist/server/server.js` and manages WebSocket connections.

Set environment variables `REDIS_URL`, `PORT` and `NODE_ENV` on Render.

## Testing

Run unit tests with Jest:

```bash
npm test
```
