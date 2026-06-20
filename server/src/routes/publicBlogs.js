import express from 'express';
import { query } from '../db.js';
import {
  isThaiNumericComment,
  validateRequiredString,
  validateSlug
} from '../utils/validation.js';

const router = express.Router();
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function exposedError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.expose = true;
  return error;
}

function parsePositiveIntQuery(value, fallback, fieldName, max) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw exposedError(400, `${fieldName} must be a positive integer`);
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed)) {
    throw exposedError(400, `${fieldName} must be a positive integer`);
  }

  return max ? Math.min(parsed, max) : parsed;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = parsePositiveIntQuery(req.query.page, DEFAULT_PAGE, 'Page');
    const limit = parsePositiveIntQuery(req.query.limit, DEFAULT_LIMIT, 'Limit', MAX_LIMIT);
    const offset = (page - 1) * limit;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const where = ['published = true'];
    const params = [];

    if (search.length > 0) {
      params.push(`%${search}%`);
      where.push(`title ILIKE $${params.length}`);
    }

    const whereSql = `WHERE ${where.join(' AND ')}`;
    const listParams = [...params, limit, offset];
    const limitPlaceholder = `$${params.length + 1}`;
    const offsetPlaceholder = `$${params.length + 2}`;

    const blogsResult = await query(
      `
        SELECT id, title, slug, excerpt, cover_image_url, image_urls, posted_at, view_count
        FROM blogs
        ${whereSql}
        ORDER BY posted_at DESC
        LIMIT ${limitPlaceholder}
        OFFSET ${offsetPlaceholder}
      `,
      listParams
    );
    const countResult = await query(
      `
        SELECT COUNT(*)::int AS total
        FROM blogs
        ${whereSql}
      `,
      params
    );
    const total = Number(countResult.rows[0]?.total ?? 0);

    res.json({
      data: blogsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res, next) => {
    const slugValidation = validateSlug(req.params.slug);

    if (!slugValidation.valid) {
      return next(exposedError(400, slugValidation.message));
    }

    const blogResult = await query(
      `
        UPDATE blogs
        SET view_count = view_count + 1
        WHERE slug = $1 AND published = true
        RETURNING id, title, slug, excerpt, content, cover_image_url, image_urls, posted_at, view_count
      `,
      [slugValidation.value]
    );
    const blog = blogResult.rows[0];

    if (!blog) {
      return next(exposedError(404, 'Blog not found'));
    }

    const commentsResult = await query(
      `
        SELECT id, sender_name, message, created_at
        FROM comments
        WHERE blog_id = $1 AND status = 'approved'
        ORDER BY created_at ASC
      `,
      [blog.id]
    );

    res.json({
      data: {
        ...blog,
        comments: commentsResult.rows
      }
    });
  })
);

router.post(
  '/:slug/comments',
  asyncHandler(async (req, res, next) => {
    const slugValidation = validateSlug(req.params.slug);

    if (!slugValidation.valid) {
      return next(exposedError(400, slugValidation.message));
    }

    const senderName = req.body.sender_name;
    const message = req.body.message;
    const senderValidation = validateRequiredString(senderName, 'Sender name');
    const messageValidation = validateRequiredString(message, 'Comment');

    if (!senderValidation.valid) {
      return next(exposedError(400, senderValidation.message));
    }

    if (!messageValidation.valid) {
      return next(exposedError(400, messageValidation.message));
    }

    if (!isThaiNumericComment(messageValidation.value)) {
      return next(
        exposedError(
          400,
          'Comment must contain Thai characters, digits, or whitespace only'
        )
      );
    }

    const commentResult = await query(
      `
        INSERT INTO comments (blog_id, sender_name, message, status)
        SELECT id, $2, $3, 'pending'
        FROM blogs
        WHERE slug = $1 AND published = true
        RETURNING id, blog_id, sender_name, message, status, created_at
      `,
      [slugValidation.value, senderValidation.value, messageValidation.value]
    );
    const comment = commentResult.rows[0];

    if (!comment) {
      return next(exposedError(404, 'Blog not found'));
    }

    res.status(201).json({ data: comment });
  })
);

export default router;
