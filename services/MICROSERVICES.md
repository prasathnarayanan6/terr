# Microservices

This repo now contains standalone service folders for the remaining APIs that
were still inside the demo monolith.

## Shared runtime

Install the shared runtime dependencies once:

```powershell
cd services/microservice-runtime
npm install
```

The runtime reuses the existing route, controller, service, and demo-data logic
copied from `services/api/src`, so the frontend contract stays unchanged.

## Local ports

- `dashboard-api`: `http://127.0.0.1:8087/api/dashboard/overview`
- `reports-api`: `http://127.0.0.1:8088/api/reports/overview`
- `leaks-api`: `http://127.0.0.1:8089/api/leaks/summary`
- `billing-api`: `http://127.0.0.1:8090/api/billing/summary`
- `bills-api`: `http://127.0.0.1:8091/api/bills/send-bulk`
- `profile-api`: `http://127.0.0.1:8092/api/profile`
- `profile-api` settings data: `http://127.0.0.1:8092/api/profile/settings?user_mail=<user_mail-from-UserCredentials>`
- `prepaid-api`: `http://127.0.0.1:8093/api/prepaid/overview`

## Run locally

From each service directory:

```powershell
npm start
```

Example:

```powershell
cd services/dashboard-api
npm start
```

## Build and deploy

Each service folder includes its own SAM template:

```powershell
cd services/reports-api
npm run sam:build
npm run sam:deploy
```

The Lambda code package for these services is `services/microservice-runtime/`.
Each service template points at its own handler inside that shared runtime.
