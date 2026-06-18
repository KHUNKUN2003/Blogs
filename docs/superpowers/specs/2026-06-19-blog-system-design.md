# Blog System Design

## Goal

Build a simple full-stack Blog System for the technical assignment using React, Node.js, and PostgreSQL. The app must provide a public blog reading experience, comment submission with moderation, and an authenticated admin panel for managing blogs and comments.

## Chosen Direction

Use the Balanced direction. The public UI should be clean and readable, while the admin panel should be practical and table/form driven. The implementation should prioritize complete assignment coverage over decorative complexity.

## Tech Stack

- Frontend: React with Vite
- Backend: Node.js with Express
- Database: PostgreSQL via Docker Compose
- Database access: `pg` with explicit SQL migrations and seed data
- Admin auth: login endpoint using seeded or environment-configured admin credentials, returning a token used by admin API requests

## Main Public Features

### Blog List

- Route: `/`
- Show all published blogs.
- Each blog card or row includes cover image, title, excerpt, and posted date.
- Search by blog title.
- Paginate at 10 items per page.
- Show skeleton loading while data is loading.

### Blog Detail

- Route: `/blogs/:slug`
- Show one cover image and up to six additional images, for a maximum of seven images per blog.
- Show title, posted date, full content, and view count.
- Increment view count when the detail page is opened.
- Include a comment form.

## Comment System

- Sender name is required.
- Comment message is required.
- Comment message must contain only Thai characters, Thai marks, digits, and whitespace.
- Validation runs on both frontend and backend.
- Recommended backend regex using Unicode escapes, so it is stable across editors and terminals:

```js
/^[\u0E01-\u0E590-9\s]+$/
```

- New comments are stored with `pending` status.
- Public pages show only `approved` comments.
- Pending and rejected comments are not shown publicly.

## Admin Features

### Authentication

- Route: `/admin/login`
- Admin panel routes require login.
- Invalid or missing token blocks access and sends the user back to login.

### Blog Management

- Route: `/admin`
- Create, read, update, and delete blogs.
- Publish and unpublish blogs.
- Edit URL slug.
- Validate slug uniqueness before saving.
- Enforce a maximum of seven image URLs per blog.

### Comment Moderation

- Route: `/admin/comments`
- Show submitted comments with blog title, sender name, message, status, and submitted date.
- Approve or reject each comment.
- Allow rejecting a comment that was previously approved.
- Status values: `pending`, `approved`, `rejected`.

## Data Model

### blogs

- `id`
- `title`
- `slug`
- `excerpt`
- `content`
- `cover_image_url`
- `image_urls`
- `posted_at`
- `view_count`
- `published`
- `created_at`
- `updated_at`

### comments

- `id`
- `blog_id`
- `sender_name`
- `message`
- `status`
- `created_at`
- `updated_at`

## API Shape

### Public API

- `GET /api/blogs?search=&page=&limit=10`
- `GET /api/blogs/:slug`
- `POST /api/blogs/:slug/comments`

### Admin API

- `POST /api/admin/login`
- `GET /api/admin/blogs`
- `POST /api/admin/blogs`
- `GET /api/admin/blogs/:id`
- `PUT /api/admin/blogs/:id`
- `DELETE /api/admin/blogs/:id`
- `PATCH /api/admin/blogs/:id/publish`
- `GET /api/admin/comments`
- `PATCH /api/admin/comments/:id/status`

## Visual Design

Use the 60-30-10 color principle with `#AEDCAE` as the accent:

- 60%: soft near-white green background
- 30%: white or pale green surfaces, borders, tables, cards, and form areas
- 10%: `#AEDCAE` accent for primary actions, active states, skeleton shimmer, and small highlights

The UI should be responsive. Public pages should emphasize reading comfort. Admin pages should emphasize scannable tables, compact forms, clear moderation actions, and obvious status indicators.

## Loading And Error States

- Use skeleton loading for blog list, blog detail, and admin tables.
- Show friendly empty states for no search results, no blogs, and no comments.
- Show validation messages near the relevant fields.
- Show API error messages in a non-blocking alert area.

## Testing And Verification

- Verify database setup through Docker Compose.
- Verify backend migrations and seed data.
- Verify public blog list search and pagination.
- Verify blog detail view count increments.
- Verify comment validation rejects non-Thai/non-numeric text.
- Verify pending comments do not appear publicly.
- Verify admin can approve and reject comments, including rejecting an approved comment.
- Verify admin blog CRUD, slug editing, publish/unpublish, and delete.
- Verify skeleton loading appears during async fetches.

## Scope Boundaries

- No user registration is required.
- No rich text editor is required; plain textarea content is enough.
- Image uploads are not required; admin can enter image URLs.
- No production deployment is required.
