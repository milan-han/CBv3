**Design Brief — “Car Ball .io”**

---

### 1\tObjectives

1. Turn the current local-only HTML 5 game into a browser-based, link-share, 1-v-1 experience.
2. Zero-install for players (plain https link).
3. Maintain *all* existing driving physics, field dimensions, pixel-art aesthetic, UI, and control scheme found in the current `script.js`, `index.html`, and `style.css`.
4. Keep round-trip latency imperceptible (<80 ms end-to-end under normal US broadband).
5. Architect for painless feature growth: spectators, 2-v-2, cosmetics, power-ups, ranked mode, etc.
6. Deploy on Render.com with minimal DevOps friction.

---

### 2\tHigh-Level Architecture

| Layer                                   | Responsibility                                                                                                                        | Notes                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Static Front-End**                    | Serve existing HTML/CSS/JS bundle.                                                                                                    | Use Render’s static site service or bucket-style object storage.     |
| **Match-Maker & Game Server (Node.js)** | Room creation, player registry, authoritative physics step, state diff broadcast.                                                     | Lightweight stateless container(s) behind Render’s autoscaler.       |
| **Real-Time Transport**                 | WebSocket (socket.io or uWebSockets.js).                                                                                              | Fall back to WebTransport/WebRTC only if future features demand P2P. |
| **Shared Logic Package**                | Extract physics, collision, and field definitions into an **npm** module consumed by both client and server to guarantee determinism. | Single source of truth prevents Chrome-vs-Safari drift.              |

---

### 3\tNetworking Model

* Server-authoritative simulation at **fixed 60 Hz**.
* Clients send **input deltas** only; server echoes canonical world state every tick.
* Client prediction + interpolation buffer (~100 ms) to hide jitter; rollback if authoritative state diverges > eps.
* Binary serialization (flatbuffers or custom typed array) to keep per-tick packets ≤ 200 bytes.

---

### 4\tGameplay & Room Flow

1. Landing page → “Create Game” → returns unique slug ( `/play/<roomId>` ).
2. Host sends link; friend joins → both clients emit “ready”.
3. Server starts match, tracks score to 10, handles resets & GG screen.
4. On disconnect, gracefully pause or award win; allow reconnection within 30 s.

---

### 5\tCross-Browser Determinism

* Force a **fixed-timestep physics loop** on both ends; never use variable‐delta tied to `requestAnimationFrame`.
* Normalize input polling rates.
* Use `performance.now()` for timing; avoid float precision drift by resetting world time every round.
* Run automated headless Chrome + Safari recordings each CI build to detect divergence > 1 px frame-to-frame.

---

### 6\tScalability & Reliability

* Stateless game pods; sticky WebSocket routing via Render’s load balancer and a Redis adapter for room sharding.
* Health checks at `/readyz`; restart on uncaught exception.
* Automatic horizontal scale on concurrent connection count.
* Structured logging (pino/winston) + external log drain.
* Metrics: tick duration, packets/s, RTT, reconnects.

---

### 7\tDev Experience & Quality Gates

* Convert codebase to **TypeScript** (strict).
* ESLint + Prettier + Husky pre-commit.
* Unit tests on physics module; deterministic replay tests per commit.
* CI: GitHub Actions → build, test, deploy to Render preview env, run playwright smoke test.

---

### 8\tSecurity & Abuse Prevention

* Rate-limit handshake & chat messages (future).
* Validate all client packets server-side; never trust positions.
* Basic anti-cheat: checksum inputs, detect impossible velocity spikes.
* TLS everywhere (Render default), secure cookies for session.

---

### 9\tFuture-Proofing Hooks

* Versioned protocol; clients negotiate on connect.
* Abstract rendering layer so WebGL upgrade is low-risk.
* Event bus for power-ups/cosmetics so new mechanics don’t touch core loop.
* Placeholder “spectate” message type—no server changes needed later.

---

### 10\tDeployment Checklist for MVP

1. Create two Render services: **static-site** and **web-service** (Node).
2. Set environment vars: `REDIS_URL`, `PORT`, `NODE_ENV`.
3. Enable auto-deploy on main.
4. Buy custom domain, set CNAME → Render.
5. Smoke test two players across Chrome & Safari on separate networks.

---

### 11\tDefinition of Done

* Host can send link, friend joins, game reaches 10-goal win without desync on latest Chrome **and** Safari.
* RTT ≤ 100 ms median from US-East to US-West.
* No uncaught exceptions under soak test of 500 concurrent rooms for 30 min.
* README updated with local dev & deploy steps.

---

