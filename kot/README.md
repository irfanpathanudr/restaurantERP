# Restaurant KOT Mobile App

Mobile-first React app for waiters, chefs, and billing staff. Uses the same backend as the main ERP (`/api/v1`).

## Features

| Role | Screens |
|------|---------|
| **Waiter** | Tables → add/remove items → send KOT + print |
| **Chef** | Kitchen board (poll) → pending → cooking → ready → served + reprint |
| **Manager / Cashier** | Open bills → generate invoice + print |

## Demo logins

| Role | Email | Password |
|------|-------|----------|
| Waiter | `waiter@restaurant.com` | `Waiter@123` |
| Chef | `chef@restaurant.com` | `Chef@123` |
| Cashier | `cashier@restaurant.com` | `Cashier@123` |
| Manager | `manager@restaurant.com` | `Manager@123` |
| Admin | `admin@restaurant.com` | `Admin@123` |

Re-seed staff anytime:

```bash
npm run seed --workspace=backend
```

## CORS

Backend must allow `http://localhost:3001` in `CORS_ORIGIN` (comma-separated with frontend `3000`).
