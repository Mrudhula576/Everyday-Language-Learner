// Where the FastAPI backend lives.
// Developing locally: the frontend runs on its own port (e.g. 5500) and the
// backend on 8000. Deployed: the API is served from the same site under /api.

const LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);

export const API_BASE = LOCAL ? `http://${location.hostname}:8000` : '';

// Supabase project. The publishable key is meant to be public: Row Level
// Security (backend/supabase/schema.sql) is what protects each learner's data.
// Never put the secret / service_role key here.
export const SUPABASE_URL = 'https://wzpuschngzgbmognwsbl.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_l8JrSGe6B9A2NfbVST7ztw_axlKYZcw';
