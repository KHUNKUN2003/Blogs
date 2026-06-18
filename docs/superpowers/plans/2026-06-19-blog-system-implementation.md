# Blog System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved Blog System with public blog pages, comment moderation, authenticated admin CRUD, skeleton loading, and Dockerized PostgreSQL.

**Architecture:** Use a monorepo with `server/` for Express APIs and `client/` for React + Vite. PostgreSQL runs through Docker Compose, with SQL migrations and seed data checked into `server/db/`. The frontend talks to the backend through a small API client and keeps admin auth in local storage.

**Tech Stack:** React, Vite, React Router, Node.js, Express, pg, PostgreSQL, Docker Compose, Vitest, Supertest.

---

## File Structure

- Create `package.json`: root scripts for installing, developing, testing, and database setup.
- Create `docker-compose.yml`: local PostgreSQL service.
- Create `.env.example`: documented environment variables.
- Create `server/package.json`: backend dependencies and scripts.
- Create `server/src/app.js`: Express app wiring, middleware, and routes.
- Create `server/src/server.js`: backend server entrypoint.
- Create `server/src/config.js`: environment parsing.
- Create `server/src/db.js`: PostgreSQL pool and query helper.
- Create `server/src/middleware/auth.js`: admin token guard.
- Create `server/src/utils/validation.js`: slug, image, and Thai comment validation.
- Create `server/src/routes/publicBlogs.js`: public blog list, detail, comment submission.
- Create `server/src/routes/adminAuth.js`: admin login.
- Create `server/src/routes/adminBlogs.js`: admin blog CRUD and publish state.
- Create `server/src/routes/adminComments.js`: admin comment moderation.
- Create `server/db/001_schema.sql`: database schema.
- Create `server/db/002_seed.sql`: assignment-ready seed data.
- Create `server/scripts/migrate.js`: run SQL files.
- Create `server/scripts/seed.js`: run seed SQL.
- Create `server/tests/validation.test.js`: validation unit tests.
- Create `server/tests/api.test.js`: API integration tests.
- Create `client/package.json`: frontend dependencies and scripts.
- Create `client/index.html`: Vite HTML shell.
- Create `client/src/main.jsx`: React entrypoint.
- Create `client/src/App.jsx`: route composition.
- Create `client/src/api.js`: fetch helpers.
- Create `client/src/data/auth.js`: token storage helpers.
- Create `client/src/components/*.jsx`: layout, skeletons, cards, pagination, forms, status badges.
- Create `client/src/pages/*.jsx`: public and admin pages.
- Create `client/src/styles.css`: 60-30-10 design system and responsive layout.
- Create `README.md`: setup, run, test, validation notes, admin credentials.

---

### Task 1: Project Bootstrap

**Files:**
- Create: `package.json`
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `README.md`
- Create: `server/package.json`
- Create: `client/package.json`

- [ ] **Step 1: Create root workspace scripts**

Create `package.json`:

```json
{
  "name": "blog-system-assignment",
  "private": true,
  "scripts": {
    "install:all": "npm install --prefix server && npm install --prefix client",
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "test": "npm test --prefix server && npm test --prefix client",
    "db:up": "docker compose up -d db",
    "db:down": "docker compose down",
    "db:migrate": "npm run db:migrate --prefix server",
    "db:seed": "npm run db:seed --prefix server"
  },
  "devDependencies": {
    "concurrently": "^9.1.2"
  }
}
```

- [ ] **Step 2: Create Docker PostgreSQL config**

Create `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: blog_system_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: blog_user
      POSTGRES_PASSWORD: blog_password
      POSTGRES_DB: blog_system
    ports:
      - "5432:5432"
    volumes:
      - blog_system_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U blog_user -d blog_system"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  blog_system_data:
```

- [ ] **Step 3: Create env example**

Create `.env.example`:

```env
DATABASE_URL=postgres://blog_user:blog_password@localhost:5432/blog_system
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=dev-admin-token-change-me
```

- [ ] **Step 4: Create package manifests**

Create `server/package.json` with Express, pg, CORS, dotenv, Vitest, Supertest. Create `client/package.json` with React, Vite, React Router, Vitest, and Testing Library.

- [ ] **Step 5: Install dependencies**

Run:

```powershell
npm install
npm run install:all
```

Expected: root, server, and client dependencies install without errors.

- [ ] **Step 6: Commit bootstrap**

Run:

```powershell
git add package.json package-lock.json docker-compose.yml .env.example README.md server/package.json server/package-lock.json client/package.json client/package-lock.json
git commit -m "chore: bootstrap blog system project"
```

---

### Task 2: Database Schema, Seed, And Backend Foundation

**Files:**
- Create: `server/src/config.js`
- Create: `server/src/db.js`
- Create: `server/src/app.js`
- Create: `server/src/server.js`
- Create: `server/db/001_schema.sql`
- Create: `server/db/002_seed.sql`
- Create: `server/scripts/migrate.js`
- Create: `server/scripts/seed.js`

- [ ] **Step 1: Write schema SQL**

Create `server/db/001_schema.sql` with `blogs` and `comments`. Use `image_urls TEXT[] NOT NULL DEFAULT '{}'`, `published BOOLEAN NOT NULL DEFAULT false`, unique `slug`, and comment status check `status IN ('pending','approved','rejected')`.

- [ ] **Step 2: Write seed SQL**

Create at least 12 blogs so pagination can be tested. Include a mix of published and unpublished blogs, Thai content, image URLs, and at least three comments across `pending`, `approved`, and `rejected`.

- [ ] **Step 3: Write migration runner**

Create `server/scripts/migrate.js` that reads every `.sql` file matching `001_*.sql` from `server/db/` and executes it through `pg`.

- [ ] **Step 4: Write seed runner**

Create `server/scripts/seed.js` that executes `002_seed.sql`. Make the seed idempotent by truncating `comments` and `blogs` before inserts.

- [ ] **Step 5: Write Express foundation**

Create `config.js`, `db.js`, `app.js`, and `server.js`. Add JSON parsing, CORS for `CLIENT_ORIGIN`, `/api/health`, and centralized error responses.

- [ ] **Step 6: Verify database setup**

Run:

```powershell
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev --prefix server
```

Expected: `/api/health` returns `{ "ok": true }`.

- [ ] **Step 7: Commit backend foundation**

Run:

```powershell
git add server/src server/db server/scripts docker-compose.yml server/package.json server/package-lock.json
git commit -m "feat: add database schema and express foundation"
```

---

### Task 3: Backend Validation And Public APIs

**Files:**
- Create: `server/src/utils/validation.js`
- Create: `server/src/routes/publicBlogs.js`
- Create: `server/tests/validation.test.js`
- Create: `server/tests/api.test.js`
- Modify: `server/src/app.js`

- [ ] **Step 1: Write validation tests**

Create tests that prove:

```js
expect(isThaiNumericComment("สวัสดี 123")).toBe(true);
expect(isThaiNumericComment("hello")).toBe(false);
expect(validateImageUrls(["a","b","c","d","e","f","g"]).valid).toBe(true);
expect(validateImageUrls(["1","2","3","4","5","6","7","8"]).valid).toBe(false);
```

- [ ] **Step 2: Implement validation helpers**

Implement:

```js
const THAI_NUMERIC_COMMENT_RE = /^[\u0E01-\u0E590-9\s]+$/;
```

Export `isThaiNumericComment`, `validateRequiredString`, `validateSlug`, and `validateImageUrls`.

- [ ] **Step 3: Write public API tests**

Test `GET /api/blogs` pagination/search, `GET /api/blogs/:slug` view count increment, and `POST /api/blogs/:slug/comments` pending status plus Thai validation rejection.

- [ ] **Step 4: Implement public routes**

Implement:

- `GET /api/blogs?search=&page=&limit=10`
- `GET /api/blogs/:slug`
- `POST /api/blogs/:slug/comments`

Public list must return published blogs only, sorted by `posted_at DESC`, with pagination metadata.

- [ ] **Step 5: Run backend tests**

Run:

```powershell
npm test --prefix server
```

Expected: validation and public API tests pass.

- [ ] **Step 6: Commit public APIs**

Run:

```powershell
git add server/src server/tests
git commit -m "feat: add public blog and comment APIs"
```

---

### Task 4: Admin Auth, Blog CRUD, And Comment Moderation APIs

**Files:**
- Create: `server/src/middleware/auth.js`
- Create: `server/src/routes/adminAuth.js`
- Create: `server/src/routes/adminBlogs.js`
- Create: `server/src/routes/adminComments.js`
- Modify: `server/src/app.js`
- Modify: `server/tests/api.test.js`

- [ ] **Step 1: Write admin API tests**

Cover:

- Login succeeds with `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
- Missing token returns `401`.
- Admin can create, update slug, publish/unpublish, read, and delete a blog.
- Duplicate slug returns `409`.
- More than seven image URLs returns `400`.
- Admin can approve a pending comment.
- Admin can reject a previously approved comment.

- [ ] **Step 2: Implement auth middleware**

Accept `Authorization: Bearer <ADMIN_TOKEN>`. Reject missing or wrong tokens with `401`.

- [ ] **Step 3: Implement admin auth route**

`POST /api/admin/login` compares body credentials against env values and returns `{ token }`.

- [ ] **Step 4: Implement admin blog routes**

Implement full CRUD and `PATCH /api/admin/blogs/:id/publish`. Validate required fields, slug format, unique slug, and image limit.

- [ ] **Step 5: Implement admin comment routes**

Implement `GET /api/admin/comments` and `PATCH /api/admin/comments/:id/status`, accepting only `approved` or `rejected`.

- [ ] **Step 6: Run backend tests**

Run:

```powershell
npm test --prefix server
```

Expected: all backend tests pass.

- [ ] **Step 7: Commit admin APIs**

Run:

```powershell
git add server/src server/tests
git commit -m "feat: add admin blog and comment APIs"
```

---

### Task 5: Frontend App Shell And Public Pages

**Files:**
- Create: `client/index.html`
- Create: `client/src/main.jsx`
- Create: `client/src/App.jsx`
- Create: `client/src/api.js`
- Create: `client/src/components/Layout.jsx`
- Create: `client/src/components/Skeleton.jsx`
- Create: `client/src/components/BlogCard.jsx`
- Create: `client/src/components/Pagination.jsx`
- Create: `client/src/pages/BlogListPage.jsx`
- Create: `client/src/pages/BlogDetailPage.jsx`
- Create: `client/src/styles.css`

- [ ] **Step 1: Create React shell**

Use React Router routes for `/`, `/blogs/:slug`, `/admin/login`, `/admin`, and `/admin/comments`.

- [ ] **Step 2: Implement API client**

Create helpers for `getBlogs`, `getBlog`, `submitComment`, and shared JSON error handling.

- [ ] **Step 3: Implement design tokens**

In `styles.css`, define:

```css
:root {
  --color-bg: #f7fbf5;
  --color-surface: #ffffff;
  --color-surface-muted: #eaf5e8;
  --color-accent: #aedcae;
  --color-accent-strong: #6da86f;
  --color-text: #203326;
  --color-muted: #647568;
  --color-border: #d8ead6;
}
```

- [ ] **Step 4: Implement skeleton components**

Create skeleton rows/cards with shimmer using `--color-accent`.

- [ ] **Step 5: Implement blog list**

Add search input, 10-item pagination, loading skeleton, empty state, and blog cards with cover image, title, excerpt, and date.

- [ ] **Step 6: Implement blog detail**

Show cover image, additional images, title, date, full content, view count, approved comments, and comment form. Validate Thai/numeric comments client-side before POST.

- [ ] **Step 7: Run frontend checks**

Run:

```powershell
npm run build --prefix client
```

Expected: Vite build passes.

- [ ] **Step 8: Commit public frontend**

Run:

```powershell
git add client
git commit -m "feat: add public blog frontend"
```

---

### Task 6: Admin Frontend

**Files:**
- Create: `client/src/data/auth.js`
- Create: `client/src/components/AdminLayout.jsx`
- Create: `client/src/components/StatusBadge.jsx`
- Create: `client/src/pages/AdminLoginPage.jsx`
- Create: `client/src/pages/AdminBlogsPage.jsx`
- Create: `client/src/pages/AdminCommentsPage.jsx`
- Modify: `client/src/api.js`
- Modify: `client/src/App.jsx`
- Modify: `client/src/styles.css`

- [ ] **Step 1: Implement auth helpers**

Use local storage key `blog_admin_token`. Export `getToken`, `setToken`, `clearToken`, and `isLoggedIn`.

- [ ] **Step 2: Implement admin login page**

Submit credentials to `/api/admin/login`, store token, redirect to `/admin`, and show invalid login errors.

- [ ] **Step 3: Implement protected admin layout**

Redirect unauthenticated users to `/admin/login`. Include nav links for blogs and comments plus logout.

- [ ] **Step 4: Implement blog management UI**

Show table/list of all blogs, create/edit form, slug field, image URL textarea, publish/unpublish button, save, and delete. Enforce max seven images client-side.

- [ ] **Step 5: Implement comment moderation UI**

Show comments with status badges. Provide approve and reject buttons. Keep reject enabled for approved comments.

- [ ] **Step 6: Run frontend build**

Run:

```powershell
npm run build --prefix client
```

Expected: build passes.

- [ ] **Step 7: Commit admin frontend**

Run:

```powershell
git add client
git commit -m "feat: add admin panel frontend"
```

---

### Task 7: End-To-End Verification And Polish

**Files:**
- Modify: `README.md`
- Modify: frontend or backend files only if verification finds issues.

- [ ] **Step 1: Start full stack**

Run:

```powershell
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

Expected: backend on `http://localhost:4000`, frontend on `http://localhost:5173`.

- [ ] **Step 2: Verify public flow**

Open `/`, check skeletons, search by title, page through results, open a blog, confirm view count changes after refresh, submit valid Thai comment, and confirm it does not appear immediately.

- [ ] **Step 3: Verify invalid comment**

Submit `hello 123`. Expected: client-side validation blocks it. If bypassed through API, backend returns `400`.

- [ ] **Step 4: Verify admin flow**

Login with `admin` / `admin123`. Create a blog, edit slug, publish/unpublish, delete a blog, approve a pending comment, then reject the approved comment.

- [ ] **Step 5: Verify responsive UI**

Check desktop and mobile widths. Ensure no text overlaps, tables are scrollable or stacked, and buttons fit their containers.

- [ ] **Step 6: Final test pass**

Run:

```powershell
npm test
npm run build --prefix client
```

Expected: all tests and client build pass.

- [ ] **Step 7: Commit final polish**

Run:

```powershell
git add README.md client server
git commit -m "docs: add setup and verification notes"
```

---

## Self-Review

- Spec coverage: public list, search, pagination, detail page, max seven images, view count, Thai/numeric comments, pending approval, admin login, blog CRUD, publish/unpublish, slug edit, delete, approve/reject including approved-to-rejected, skeleton loading, 60-30-10 palette, React, Node.js, PostgreSQL, and Docker Compose are covered.
- Placeholder scan: no unresolved markers or vague deferred-work notes remain.
- Type consistency: API names, table fields, comment statuses, token header, and route paths are consistent across tasks.
