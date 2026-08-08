const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const API_CONFIG = {
  BASE_URL: apiBase,
  /** Backend origin for static files (/uploads/...) — strip trailing /api/v1 */
  SERVER_URL: apiBase.replace(/\/api\/v1\/?$/, ''),
  TIMEOUT: 30000,
};

export const POLL_INTERVAL_MS = 8000;
