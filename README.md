# Rental Hub

A complete vehicle rental platform built with free, open-source technologies:

- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js, Express, MongoDB
- Authentication: JWT-based role system (user / owner / admin)
- Images: Cloudinary
- Payments: Razorpay test mode
- Hosting: Vercel for frontend, Render/Railway for backend

## Folder structure

- `backend/` - Express API server
  - `config/db.js` - MongoDB connection
  - `controllers/` - controllers for auth, vehicles, bookings, payments, reviews, admin
  - `models/` - Mongoose schemas
  - `routes/` - REST API routing
  - `middlewares/` - authentication and authorization
  - `utils/` - Razorpay and Cloudinary utilities

- `frontend/` - Next.js application
  - `pages/` - public pages and dashboards
  - `components/` - reusable UI components
  - `context/` - authentication provider
  - `lib/api.js` - Axios client with token support

## Features

- User signup / login
- Search vehicles by city and type
- Book vehicles for a date range
- Online payment via Razorpay
- Booking history for users
- Owner listing creation and booking management
- Admin management for users, vehicles, and bookings
- Ratings and reviews for paid bookings

## Setup

### 1. Clone repository

```bash
cd Rental_Hub
```

### 2. Create environment files

- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.local.example` to `frontend/.env.local`

Fill in your values for:

- `MONGO_URI`
- `JWT_SECRET`
- `CLOUDINARY_*`
- `RAZORPAY_*`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

### 3. Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

### 4. Start development servers

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Open the frontend at `http://localhost:3000`.

## Backend API Endpoints

- `POST /api/auth/register` - register user/owner
- `POST /api/auth/login` - login and receive JWT
- `GET /api/auth/profile` - current user profile
- `GET /api/vehicles` - search approved vehicles
- `GET /api/vehicles/:id` - vehicle details
- `POST /api/vehicles` - add a vehicle listing
- `GET /api/vehicles/owner/list` - owner vehicles
- `PUT /api/vehicles/:id` - update vehicle
- `PUT /api/vehicles/approve/:id` - admin approves vehicle
- `POST /api/bookings` - create booking
- `GET /api/bookings/me` - user bookings
- `GET /api/bookings/owner` - owner booking requests
- `GET /api/bookings/all` - admin booking list
- `PUT /api/bookings/:id/status` - update booking status
- `POST /api/payments/order` - create Razorpay order
- `POST /api/payments/verify` - verify payment
- `POST /api/reviews` - submit a review
- `GET /api/reviews/vehicle/:vehicleId` - reviews by vehicle
- `GET /api/admin/users` - admin user list
- `GET /api/admin/vehicles` - admin vehicle list
- `GET /api/admin/bookings` - admin booking list

## Deployment

### Frontend (Vercel)

- Add the `frontend` project to Vercel.
- Set environment variables in Vercel dashboard.
- Build command: `npm run build`
- Output directory: `.next`

### Backend (Render or Railway)

- Add the `backend` project.
- Set environment variables from `backend/.env`.
- Start command: `npm run start` or `npm run dev` for development.
- Ensure your database and Cloudinary values are available.

## Notes

- Use MongoDB Atlas free tier for the database.
- Use Cloudinary free tier for image uploads.
- Use Razorpay test credentials for payments.
- The admin role can be created manually in the database or by registering with `role: admin` during signup.

## Quick start

1. Start backend server
2. Start frontend server
3. Register as a user or owner
4. Add a vehicle listing as owner
5. Approve the vehicle as admin
6. Book it as a user and complete a payment
7. Submit a review after the booking
