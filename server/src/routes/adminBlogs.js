import express from 'express';
import { query } from '../db.js';
import { exposedError } from '../middleware/auth.js';
import {
  validateImageUrls,
  validatePositiveIntegerId,
  validateRequiredString,
  validateSlug
} from '../utils/validation.js';

const router = express.Router();
const MAX_ADDITIONAL_IMAGE_URLS = 6;

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function validateBlogPayload(body) {
  const title = validateRequiredString(body.title, 'Title');
  const slug = validateSlug(body.slug);
  const excerpt = validateRequiredString(body.excerpt, 'Excerpt');
  const content = validateRequiredString(body.content, 'Content');
  const coverImageUrl = validateRequiredString(body.cover_image_url, 'Cover image url');
  const imageUrls = body.image_urls === undefined ? [] : body.image_urls;

  if (
    Array.isArray(imageUrls) &&
    imageUrls.length > MAX_ADDITIONAL_IMAGE_URLS
  ) {
    throw exposedError(
      400,
      'Image urls cannot contain more than 6 items when a cover image is included'
    );
  }

  const imageUrlsValidation = validateImageUrls(imageUrls);

  for (const validation of [title, slug, excerpt, content, coverImageUrl, imageUrlsValidation]) {
    if (!validation.valid) {
      throw exposedError(400, validation.message);
    }
  }

  return {
    title: title.value,
    slug: slug.value,
    excerpt: excerpt.value,
    content: content.value,
    cover_image_url: coverImageUrl.value,
    image_urls: imageUrlsValidation.value
  };
}

function validateRouteId(value) {
  const id = validatePositiveIntegerId(value);

  if (!id.valid) {
    throw exposedError(400, id.message);
  }

  return id.value;
}

async function ensureUniqueSlug(slug, excludedId) {
  const params = excludedId === undefined ? [slug] : [slug, excludedId];
  const excludedSql = excludedId === undefined ? '' : ' AND id <> $2';
  const result = await query(
    `SELECT id FROM blogs WHERE slug = $1${excludedSql}`,
    params
  );

  if (result.rows.length > 0) {
    throw exposedError(409, 'Slug already exists');
  }
}

function handleDuplicateSlug(error) {
  if (error?.code === '23505' && error?.constraint?.includes('slug')) {
    throw exposedError(409, 'Slug already exists');
  }

  throw error;
}

function notFoundIfMissing(row) {
  if (!row) {
    throw exposedError(404, 'Blog not found');
  }

  return row;
}

const blogSelectFields = `
  id, title, slug, excerpt, content, cover_image_url, image_urls,
  posted_at, view_count, published, created_at, updated_at
`;

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const result = await query(
      `
        SELECT ${blogSelectFields}
        FROM blogs
        ORDER BY posted_at DESC
      `,
      []
    );

    res.json({ data: result.rows });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const blog = validateBlogPayload(req.body);

    await ensureUniqueSlug(blog.slug);

    try {
      const result = await query(
        `
          INSERT INTO blogs (
            title, slug, excerpt, content, cover_image_url, image_urls
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING ${blogSelectFields}
        `,
        [
          blog.title,
          blog.slug,
          blog.excerpt,
          blog.content,
          blog.cover_image_url,
          blog.image_urls
        ]
      );

      res.status(201).json({ data: result.rows[0] });
    } catch (error) {
      handleDuplicateSlug(error);
    }
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = validateRouteId(req.params.id);

    const result = await query(
      `
        SELECT ${blogSelectFields}
        FROM blogs
        WHERE id = $1
      `,
      [id]
    );

    res.json({ data: notFoundIfMissing(result.rows[0]) });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = validateRouteId(req.params.id);
    const blog = validateBlogPayload(req.body);

    await ensureUniqueSlug(blog.slug, id);

    try {
      const result = await query(
        `
          UPDATE blogs
          SET
            title = $1,
            slug = $2,
            excerpt = $3,
            content = $4,
            cover_image_url = $5,
            image_urls = $6,
            updated_at = NOW()
          WHERE id = $7
          RETURNING ${blogSelectFields}
        `,
        [
          blog.title,
          blog.slug,
          blog.excerpt,
          blog.content,
          blog.cover_image_url,
          blog.image_urls,
          id
        ]
      );

      res.json({ data: notFoundIfMissing(result.rows[0]) });
    } catch (error) {
      handleDuplicateSlug(error);
    }
  })
);

router.patch(
  '/:id/publish',
  asyncHandler(async (req, res) => {
    const id = validateRouteId(req.params.id);

    if (typeof req.body.published !== 'boolean') {
      throw exposedError(400, 'Published must be a boolean');
    }

    const result = await query(
      `
        UPDATE blogs
        SET published = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING ${blogSelectFields}
      `,
      [req.body.published, id]
    );

    res.json({ data: notFoundIfMissing(result.rows[0]) });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = validateRouteId(req.params.id);

    const result = await query(
      `
        DELETE FROM blogs
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    notFoundIfMissing(result.rows[0]);
    res.status(204).send();
  })
);

export default router;
