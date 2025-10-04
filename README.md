# Web Email Scanner — Local Dev in VS Code

Run everything **locally** in VS Code without deploying online.

## Quick Start
1) Install prerequisites:
   - Node.js 18+
   - Python 3.10+
   - (Option A) ClamAV daemon `clamd` (Linux/macOS) **or**
   - (Option B, recommended cross‑platform) Docker Desktop only for `clamav`

2) Open this folder in VS Code.

3) VS Code: Run **Terminal → Run Task… → Start All (Local)**, or use the `Run and Debug` sidebar and choose **Start All (Compound)**.

4) Open Frontend dev server (Vite): http://localhost:5173

### Services (local)
- frontend (Vite): http://localhost:5173
- backend (Node/Express): http://localhost:3000
- scanner (FastAPI): http://localhost:8000
