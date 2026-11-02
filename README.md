# StudioSpace API

Express + MongoDB REST API for **StudioSpace**, the peer-to-peer creative workspace marketplace.

## Endpoints

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/studios` | – | List studios (`q`, `category`, `sort`, `minPrice`, `maxPrice`, `limit`) |
| GET | `/api/studios/:id` | – | Studio details |
| GET | `/api/studios/:id/availability?date=` | – | Reserved hours for a date |
| GET | `/api/studios/mine` | ✔ | Listings owned by me |
| POST | `/api/studios` | ✔ | Create listing |
| PUT | `/api/studios/:id` | ✔ owner | Update listing |
| DELETE | `/api/studios/:id` | ✔ owner | Delete listing |
| POST | `/api/studios/:id/reviews` | ✔ | Add / replace my review |
| POST | `/api/bookings` | ✔ | Create a `Pending` booking (clash-checked) |
| GET | `/api/bookings/mine` | ✔ | My reservations |
| GET | `/api/bookings/requests` | ✔ | Reservations on studios I host |
| PATCH | `/api/bookings/:id/status` | ✔ | Cancel / confirm / complete |

Protected routes expect a Firebase ID token: `Authorization: Bearer <token>`. Tokens are verified against Google's public keys with `jose`, so only the Firebase **project id** is needed.

## Local setup

```bash
npm install
cp .env.example .env   # fill in MONGODB_URI and FIREBASE_PROJECT_ID
npm run seed           # optional demo data
npm run dev
```

Deploy to Vercel: import this folder, add the same environment variables, deploy.
