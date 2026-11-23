// Where the FastAPI backend lives.
// Developing locally: the frontend runs on its own port (e.g. 5500) and the
// backend on 8000. Deployed: the API is served from the same site under /api.

const LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);

export const API_BASE = LOCAL ? `http://${location.hostname}:8000` : '';
