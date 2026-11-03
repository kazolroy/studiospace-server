# StudioSpace Server

REST API for StudioSpace, a peer-to-peer creative studio booking platform. Built with Node.js, Express and MongoDB.

**Client Repo:** https://github.com/kazolroy/studiospace-client
**Live API:** https://YOUR-API.vercel.app

## Features

- Studio CRUD with search, category and price filters, and sorting
- Booking system with overlap check, so the same hour cannot be booked twice
- Booking status flow: Pending, Confirmed, Completed, Cancelled
- Reviews with automatic rating calculation
- Firebase token verification for protected routes
- Owner-only update and delete

## API Endpoints

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/studios` | No | List studios (search, filter, sort, limit) |
| GET | `/api/studios/:id` | No | Studio details |
| GET | `/api/studios/:id/availability` | No | Booked hours for a date |
| GET | `/api/studios/mine` | Yes | My studios |
| POST | `/api/studios` | Yes | Add studio |
| PUT | `/api/studios/:id` | Yes | Update studio (owner) |
| DELETE | `/api/studios/:id` | Yes | Delete studio (owner) |
| POST | `/api/studios/:id/reviews` | Yes | Add review |
| POST | `/api/bookings` | Yes | Create booking |
| GET | `/api/bookings/mine` | Yes | My bookings |
| GET | `/api/bookings/requests` | Yes | Requests on my studios |
| PATCH | `/api/bookings/:id/status` | Yes | Update booking status |

## Tech Stack

Node.js, Express, MongoDB, jose, dotenv, cors

## Local Setup

1. Clone and install
   ```bash
   git clone https://github.com/kazolroy/studiospace-server.git
   cd studiospace-server
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in
   ```
   PORT=5000
   MONGODB_URI=your-mongodb-connection-string
   DB_NAME=studiospace
   FIREBASE_PROJECT_ID=your-firebase-project-id
   CLIENT_URLS=http://localhost:5173
   ```
3. Add demo data (optional)
   ```bash
   npm run seed
   ```
4. Start the server
   ```bash
   npm run dev
   ```
5. API runs at http://localhost:5000
