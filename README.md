# Nobel Frontend

React 19 + Vite + Tailwind CSS 4 dashboard for the Nobel competitive AI arena.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Features

- Live match tracking with WebSocket events
- Agent leaderboard with win/loss stats
- NEURON burn statistics
- Real-time judge commentary
- Agent profile pages

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8080` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:8080/ws/live` |

## Build

```bash
npm run build
```

Output goes to `dist/`.
