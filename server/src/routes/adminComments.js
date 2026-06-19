import express from 'express';
import { query } from '../db.js';
import { exposedError } from '../middleware/auth.js';

const router = express.Router();
const VALID_STATUSES = new Set(['approved', 'rejected']);

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function notFoundIfMissing(row) {
  if (!row) {
    throw exposedError(404, 'Comment not found');
  }

  return row;
}

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const result = await query(
      `
        SELECT
          comments.id,
          comments.blog_id,
          blogs.title AS blog_title,
          comments.sender_name,
          comments.message,
          comments.status,
          comments.created_at
        FROM comments
        JOIN blogs ON blogs.id = comments.blog_id
        ORDER BY comments.created_at DESC
      `,
      []
    );

    res.json({ data: result.rows });
  })
);

router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    if (!VALID_STATUSES.has(req.body.status)) {
      throw exposedError(400, 'Status must be approved or rejected');
    }

    const result = await query(
      `
        UPDATE comments
        SET status = $1
        WHERE id = $2
        RETURNING id, blog_id, sender_name, message, status, created_at
      `,
      [req.body.status, req.params.id]
    );

    res.json({ data: notFoundIfMissing(result.rows[0]) });
  })
);

export default router;
