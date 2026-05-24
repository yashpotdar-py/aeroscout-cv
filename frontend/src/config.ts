/**
 * Backend URL configuration.
 *
 * In development (npm run dev): falls back to localhost.
 * In production (Render static site): VITE_BACKEND_HTTP_URL is injected
 * at build time from the backend service's RENDER_EXTERNAL_URL.
 *
 * Vite replaces import.meta.env.VITE_* at compile time — these values
 * are embedded in the JS bundle and are NOT secret.
 */

const rawHttpUrl: string =
  import.meta.env.VITE_BACKEND_HTTP_URL ?? 'http://localhost:8000'

// Strip any trailing slash so callers can safely append paths
const httpUrl = rawHttpUrl.replace(/\/$/, '')

/**
 * Base HTTP URL for the backend REST API.
 * e.g. "https://aeroscout-backend.onrender.com" or "http://localhost:8000"
 */
export const BACKEND_HTTP_URL: string = httpUrl

/**
 * WebSocket URL for the backend /ws endpoint.
 * Automatically converts:
 *   http://  → ws://
 *   https:// → wss://
 */
export const BACKEND_WS_URL: string = httpUrl.replace(/^http/, 'ws') + '/ws'
