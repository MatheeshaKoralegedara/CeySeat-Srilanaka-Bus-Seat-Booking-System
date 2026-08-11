# CeySeat — Sri Lanka Bus Seat Booking System

A backend + frontend system for booking bus seats across Sri Lanka, with real-time seat availability, secure payments, and concurrency-safe reservations.

## Stack

- **Backend:** Spring Boot 3.5.7 (Java 17), MongoDB Atlas
- **Frontend:** React (Vite)
- **Auth:** JWT (role-based: Passenger / Operator / Admin)
- **Payments:** PayHere (Sri Lankan payment gateway)
- **Deployment:** Docker + Docker Compose

## Local setup

### Prerequisites
- Java 17
- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- PayHere sandbox account

### Backend

1. Copy `.env.example` to `.env` and fill in real values:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PAYHERE_MERCHANT_ID`
   - `PAYHERE_MERCHANT_SECRET`
2. Run:

./mvnw spring-boot:run

3. API docs available at `http://localhost:8080/swagger-ui.html`

### Frontend

cd frontend
npm install
npm run dev

Runs at `http://localhost:5173`

### Docker (backend only)

docker-compose up --build

Reads the same `.env` file at the project root.

## Architecture notes

- **Concurrency-safe seat reservation:** a MongoDB unique compound index on `(scheduleId, seatNo)`, scoped to `RESERVED`/`PAID` bookings, prevents double-booking under concurrent requests at the database level — not relying on application-level locking.
- **Stale reservation cleanup:** a scheduled job (`ReservationExpiryJob`) runs every 60 seconds and releases holds that have exceeded their reservation window.
- **Payment confirmation:** bookings only flip to `PAID` via PayHere's server-to-server notify webhook, with MD5 signature verification — never trusting a client-side redirect alone.
- **Rate limiting:** booking and payment endpoints are throttled per-IP (10 requests/minute) to reduce scripted abuse.

## Testing payments locally

PayHere's sandbox notify webhook requires a publicly reachable URL. For local development, use `ngrok`:

ngrok http 8080

Update `notify_url` in the frontend's payment request to match your ngrok URL.

## Project structure

src/main/java/com/CeySeat/BusSeatBooking/
├── config/ — Security, JWT, CORS, rate limiting
├── controller/ — REST endpoints
├── dto/ — Request/response objects
├── exception/ — Custom exceptions + global handler
├── model/ — MongoDB documents
├── repository/ — Spring Data Mongo repositories
├── scheduler/ — Background jobs
└── service/ — Business logic


## License

See [LICENSE](./LICENSE)