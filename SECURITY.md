# Security Policy

## Supported Versions

AeroScout-CV is a research showcase project. Security patches are applied to the latest version on `main`.

| Version | Supported |
|---|---|
| `main` (latest) | ✅ |
| Older commits | ❌ |

---

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub Issues.**

If you discover a security vulnerability, please report it responsibly:

1. **Email**: Open a [GitHub Security Advisory](https://github.com/yashpotdar-py/aeroscout-cv/security/advisories/new) (preferred — keeps it private)
2. **Alternatively**: Email the maintainer directly via the contact on [GitHub profile](https://github.com/yashpotdar-py)

Please include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested mitigation

You can expect an acknowledgement within **48 hours** and a resolution within **7 days** for critical issues.

---

## Scope

This project is a **research and portfolio showcase**. The following are in scope:

- FastAPI backend endpoints
- WebSocket data handling
- Docker configuration
- Dependency vulnerabilities

The following are **out of scope**:
- MAVLink protocol vulnerabilities (upstream: [pymavlink](https://github.com/ArduPilot/pymavlink))
- Leaflet.js vulnerabilities (upstream: [leaflet](https://github.com/Leaflet/Leaflet))
- Physical drone hardware security

---

## Security Considerations for Deployers

> [!WARNING]
> The backend currently uses `allow_origins=["*"]` in CORS middleware. If you deploy this to a production environment (not localhost), you **must** restrict this to your specific frontend origin.

- Do **not** expose the backend directly to the internet without authentication
- The `/rpi/data` endpoint has no authentication — restrict network access appropriately
- Keep `MODEL_PATH` and `.env` outside of version control
- Demo data video files may contain location metadata — review before sharing
