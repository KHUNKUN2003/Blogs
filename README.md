# Blog System Assignment

Full-stack blog system for the assignment, with a React public/admin frontend, an Express API, and PostgreSQL through Docker Compose.

## Tech Stack

- Client: React, Vite, React Router, Vitest, Testing Library
- Server: Node.js, Express, pg, CORS, dotenv, Vitest, Supertest
- Database: PostgreSQL 16 via Docker Compose

## Setup

```powershell
npm install
npm run install:all
Copy-Item .env.example server/.env
```

Start the database:

```powershell
npm run db:up
```

After migrations and seed scripts are added in the next task, run:

```powershell
npm run db:migrate
npm run db:seed
```

## Run

```powershell
npm run dev
```

The API will run on `http://localhost:4000` and the client on `http://localhost:5173`.

## Test

```powershell
npm test
```

## Default Admin

- Username: `admin`
- Password: `admin123`
- Development token: `dev-admin-token-change-me`

Change these values before using the app outside local development.

## Comment Validation

Public comments must contain only Thai characters, numeric digits, and whitespace. New comments are saved as pending until an admin approves or rejects them.
