# Ballot Box Server

Simple Express server to accept votes (in-memory). This is a scaffold and not secure.

Endpoints:

- GET / -> service info
- GET /health -> health check
- POST /vote -> body: { voterId, candidate }
- GET /votes -> list received votes

Run:

```powershell
npm --workspace servers/ballot-box-server run start
```
