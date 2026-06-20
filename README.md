# Blog System Assignment

Full-stack blog system for the assignment, with a React public/admin frontend, an Express API, and PostgreSQL through Docker Compose.

## Tech Stack

- Client: React, Vite, React Router, Vitest, Testing Library
- Server: Node.js, Express, pg, CORS, dotenv, Vitest, Supertest
- Database: PostgreSQL 16 via Docker Compose

## Setup

Use Node.js 20.19 or newer and make sure Docker Desktop is running before starting PostgreSQL.

```powershell
npm install
npm run install:all
Copy-Item .env.example server/.env
```

If PowerShell blocks `npm.ps1`, use `npm.cmd` instead:

```powershell
npm.cmd install
npm.cmd run install:all
```

Start the database:

```powershell
npm run db:up
npm run db:migrate
npm run db:seed
```

## Run

```powershell
npm run dev
```

The API runs on `http://localhost:4000` and the client runs on `http://localhost:5173`.

## Features

- Public blog list with cover image, title, excerpt, posted date, title search, and 10-item pagination
- Public blog detail with cover image, up to 6 additional images, full content, view count, and approved comments
- Comment submission with required sender name and Thai/numeric message validation
- Pending comments stay hidden until approved by an admin
- Admin login, blog CRUD, slug editing, publish/unpublish, delete, and comment approve/reject
- Admin can reject comments that were previously approved
- Skeleton loading states on public and admin screens

## Test

```powershell
npm test
npm run build --prefix client
```

## Default Admin

- Username: `admin`
- Password: `admin123`
- Development token: `dev-admin-token-change-me`

Change these values before using the app outside local development.

## Comment Validation

Public comments must contain only Thai characters, numeric digits, and whitespace. New comments are saved as pending until an admin approves or rejects them.

The validation is implemented on both client and server with this character rule:

```js
/^[\u0E01-\u0E590-9\s]+$/
```

## Notes

- The public search is intentionally title-only to match the assignment.
- The cover image plus additional images are capped at 7 total images per blog.
- Local development allows the default admin credentials above. Production mode requires non-default admin credentials and token.
