# Eligibility Server

Lightweight Express server that exposes a simple eligibility check endpoint.

Endpoints:

- GET / -> service info
- GET /health -> health check
- POST /check -> body: { voterId }

Run:

```powershell
npm --workspace servers/eligibility-server run start
```
