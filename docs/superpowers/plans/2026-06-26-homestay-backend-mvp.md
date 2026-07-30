# Homestay Backend MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Express + MongoDB backend MVP for internal hourly homestay booking management.

**Architecture:** A simple Express API under `back_end/src`, split into config, models, controllers, routes, and middlewares. Business rules for booking creation and status logs live in `bookingController` so new learners can follow the flow without jumping through many abstractions.

**Tech Stack:** Node.js, Express, Mongoose, MongoDB, JWT, bcrypt, dotenv, cors, Jest, Supertest, mongodb-memory-server.

---

### Task 1: Project Setup

**Files:**
- Create: `back_end/package.json`
- Create: `back_end/.env.example`
- Create: `back_end/src/server.js`
- Create: `back_end/src/app.js`
- Create: `back_end/src/config/db.js`

- [ ] Add npm scripts and dependencies.
- [ ] Add Express app wiring with `cors` and `express.json()`.
- [ ] Add reusable MongoDB connection helper.

### Task 2: Models

**Files:**
- Create: `back_end/src/models/User.js`
- Create: `back_end/src/models/Room.js`
- Create: `back_end/src/models/Customer.js`
- Create: `back_end/src/models/Booking.js`

- [ ] Define schemas using the exact fields requested.
- [ ] Add enum validation for roles, room status, and booking status.
- [ ] Add timestamps.

### Task 3: Auth

**Files:**
- Create: `back_end/src/middlewares/authMiddleware.js`
- Create: `back_end/src/middlewares/roleMiddleware.js`
- Create: `back_end/src/controllers/authController.js`
- Create: `back_end/src/routes/authRoutes.js`

- [ ] Implement `POST /api/auth/login`.
- [ ] Implement `GET /api/auth/me`.
- [ ] Compare passwords with bcrypt.
- [ ] Sign JWT using `JWT_SECRET`.

### Task 4: CRUD APIs

**Files:**
- Create: `back_end/src/controllers/roomController.js`
- Create: `back_end/src/routes/roomRoutes.js`
- Create: `back_end/src/controllers/customerController.js`
- Create: `back_end/src/routes/customerRoutes.js`

- [ ] Implement rooms CRUD.
- [ ] Implement customers CRUD.
- [ ] Restrict room create/update/delete to admin.
- [ ] Protect all routes with JWT.

### Task 5: Booking APIs

**Files:**
- Create: `back_end/src/controllers/bookingController.js`
- Create: `back_end/src/routes/bookingRoutes.js`
- Test: `back_end/tests/booking.test.js`

- [ ] Add failing tests for minimum 3 hours and overlapping booking.
- [ ] Implement booking create validation and price calculation.
- [ ] Implement booking CRUD.
- [ ] Implement status patch with logs.
- [ ] Implement internal notes endpoint.

### Task 6: Dashboard

**Files:**
- Create: `back_end/src/controllers/dashboardController.js`
- Create: `back_end/src/routes/dashboardRoutes.js`

- [ ] Return counts and revenue summary.
- [ ] Protect dashboard route with JWT.

### Task 7: Verification

- [ ] Install packages.
- [ ] Run tests.
- [ ] Run `npm run check`.
- [ ] Explain how to run backend on Windows in VS Code.
