import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../src/app.js';
import { query } from '../src/db.js';

vi.mock('../src/db.js', () => ({
  query: vi.fn()
}));

const thaiGreeting = '\u0e2a\u0e27\u0e31\u0e2a\u0e14\u0e35';
const thaiNumericMessage = `${thaiGreeting} 123`;
const adminToken = 'dev-admin-token-change-me';

const adminHeaders = {
  Authorization: `Bearer ${adminToken}`
};

const blogPayload = {
  title: 'Admin Blog',
  slug: 'admin-blog',
  excerpt: 'Admin excerpt',
  content: 'Admin content',
  cover_image_url: 'cover.jpg',
  image_urls: ['one.jpg']
};

describe('public blog API', () => {
  beforeEach(() => {
    query.mockReset();
  });

  it('returns published blogs with search and pagination metadata', async () => {
    query
      .mockResolvedValueOnce({
        rows: [
          {
            id: '2',
            title: 'Second',
            slug: 'second',
            excerpt: 'Second excerpt',
            cover_image_url: 'second-cover.jpg',
            image_urls: ['second.jpg'],
            posted_at: '2026-06-18T00:00:00.000Z',
            view_count: 9
          }
        ]
      })
      .mockResolvedValueOnce({ rows: [{ total: '3' }] });

    const response = await request(app)
      .get('/api/blogs')
      .query({ search: 'sec', page: 2, limit: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [
        {
          id: '2',
          title: 'Second',
          slug: 'second',
          excerpt: 'Second excerpt',
          cover_image_url: 'second-cover.jpg',
          image_urls: ['second.jpg'],
          posted_at: '2026-06-18T00:00:00.000Z',
          view_count: 9
        }
      ],
      pagination: {
        page: 2,
        limit: 1,
        total: 3,
        totalPages: 3
      }
    });
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0]).toContain('WHERE published = true');
    expect(query.mock.calls[0][0]).toContain('cover_image_url');
    expect(query.mock.calls[0][0]).toContain('posted_at');
    expect(query.mock.calls[0][0]).toContain('view_count');
    expect(query.mock.calls[0][0]).toContain('title ILIKE $1');
    expect(query.mock.calls[0][0]).not.toContain('OR excerpt ILIKE');
    expect(query.mock.calls[0][0]).not.toContain('OR content ILIKE');
    expect(query.mock.calls[0][0]).toContain('ORDER BY posted_at DESC');
    expect(query.mock.calls[0][1]).toEqual(['%sec%', 1, 1]);
  });

  it('rejects malformed page values before querying', async () => {
    const response = await request(app).get('/api/blogs').query({ page: '2abc' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Page must be a positive integer' });
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects decimal limit values before querying', async () => {
    const response = await request(app).get('/api/blogs').query({ limit: '1.9' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Limit must be a positive integer' });
    expect(query).not.toHaveBeenCalled();
  });

  it('returns a published blog by slug, increments views, and includes approved comments only', async () => {
    query
      .mockResolvedValueOnce({
        rows: [
          {
            id: '1',
            title: 'First',
            slug: 'first',
            excerpt: 'First excerpt',
            content: 'First content',
            cover_image_url: 'first-cover.jpg',
            image_urls: [],
            posted_at: '2026-06-19T00:00:00.000Z',
            view_count: 5
          }
        ]
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: '9',
            sender_name: 'Mali',
            message: thaiGreeting,
            created_at: '2026-06-19T01:00:00.000Z'
          }
        ]
      });

    const response = await request(app).get('/api/blogs/first');

    expect(response.status).toBe(200);
    expect(response.body.data.slug).toBe('first');
    expect(response.body.data.view_count).toBe(5);
    expect(response.body.data.comments).toEqual([
      {
        id: '9',
        sender_name: 'Mali',
        message: thaiGreeting,
        created_at: '2026-06-19T01:00:00.000Z'
      }
    ]);
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0]).toContain('view_count = view_count + 1');
    expect(query.mock.calls[0][0]).toContain('cover_image_url');
    expect(query.mock.calls[0][0]).toContain('posted_at');
    expect(query.mock.calls[1][0]).toContain('sender_name');
    expect(query.mock.calls[1][0]).toContain('message');
    expect(query.mock.calls[1][0]).toContain("status = 'approved'");
  });

  it('creates pending comments for Thai numeric messages', async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          id: '12',
          blog_id: '1',
          sender_name: 'Mali',
          message: thaiNumericMessage,
          status: 'pending',
          created_at: '2026-06-19T01:00:00.000Z'
        }
      ]
    });

    const response = await request(app)
      .post('/api/blogs/first/comments')
      .send({ sender_name: 'Mali', message: thaiNumericMessage });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      sender_name: 'Mali',
      message: thaiNumericMessage,
      status: 'pending'
    });
    expect(query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO comments'), [
      'first',
      'Mali',
      thaiNumericMessage
    ]);
    expect(query.mock.calls[0][0]).toContain('sender_name');
    expect(query.mock.calls[0][0]).toContain('message');
    expect(query.mock.calls[0][0]).not.toContain('author_email');
    expect(query.mock.calls[0][0]).not.toContain('author_name');
    expect(query.mock.calls[0][0]).not.toContain('content');
  });

  it('rejects legacy comment payload aliases before inserting', async () => {
    const response = await request(app)
      .post('/api/blogs/first/comments')
      .send({ author_name: 'Mali', content: thaiNumericMessage });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Sender name is required' });
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects non-Thai comment messages before inserting', async () => {
    const response = await request(app)
      .post('/api/blogs/first/comments')
      .send({ sender_name: 'Mali', message: 'hello' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Comment must contain Thai characters, digits, or whitespace only'
    });
    expect(query).not.toHaveBeenCalled();
  });
});

describe('admin API', () => {
  beforeEach(() => {
    query.mockReset();
  });

  it('logs in with configured admin credentials', async () => {
    const response = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'admin123' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ token: adminToken });
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects missing and wrong admin tokens before querying protected routes', async () => {
    const missingResponse = await request(app).get('/api/admin/blogs');
    const wrongResponse = await request(app)
      .get('/api/admin/blogs')
      .set('Authorization', 'Bearer wrong-token');

    expect(missingResponse.status).toBe(401);
    expect(wrongResponse.status).toBe(401);
    expect(missingResponse.body).toEqual({ error: 'Unauthorized' });
    expect(wrongResponse.body).toEqual({ error: 'Unauthorized' });
    expect(query).not.toHaveBeenCalled();
  });

  it('creates, reads, updates slug, publishes, unpublishes, and deletes a blog', async () => {
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: '7', ...blogPayload, published: false }]
      })
      .mockResolvedValueOnce({
        rows: [{ id: '7', ...blogPayload, published: false }]
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: '7',
            ...blogPayload,
            slug: 'admin-blog-updated',
            published: false
          }
        ]
      })
      .mockResolvedValueOnce({
        rows: [{ id: '7', ...blogPayload, slug: 'admin-blog-updated', published: true }]
      })
      .mockResolvedValueOnce({
        rows: [{ id: '7', ...blogPayload, slug: 'admin-blog-updated', published: false }]
      })
      .mockResolvedValueOnce({
        rows: [{ id: '7', ...blogPayload, slug: 'admin-blog-updated' }]
      });

    const createResponse = await request(app)
      .post('/api/admin/blogs')
      .set(adminHeaders)
      .send(blogPayload);
    const readResponse = await request(app)
      .get('/api/admin/blogs/7')
      .set(adminHeaders);
    const updateResponse = await request(app)
      .put('/api/admin/blogs/7')
      .set(adminHeaders)
      .send({ ...blogPayload, slug: 'admin-blog-updated' });
    const publishResponse = await request(app)
      .patch('/api/admin/blogs/7/publish')
      .set(adminHeaders)
      .send({ published: true });
    const unpublishResponse = await request(app)
      .patch('/api/admin/blogs/7/publish')
      .set(adminHeaders)
      .send({ published: false });
    const deleteResponse = await request(app)
      .delete('/api/admin/blogs/7')
      .set(adminHeaders);

    expect(createResponse.status).toBe(201);
    expect(readResponse.status).toBe(200);
    expect(updateResponse.status).toBe(200);
    expect(publishResponse.status).toBe(200);
    expect(unpublishResponse.status).toBe(200);
    expect(deleteResponse.status).toBe(204);
    expect(updateResponse.body.data.slug).toBe('admin-blog-updated');
    expect(publishResponse.body.data.published).toBe(true);
    expect(unpublishResponse.body.data.published).toBe(false);
    expect(query).toHaveBeenCalledTimes(8);
    expect(query.mock.calls[0][0]).toContain('SELECT id FROM blogs WHERE slug = $1');
    expect(query.mock.calls[1][0]).toContain('INSERT INTO blogs');
    expect(query.mock.calls[2][0]).toContain('FROM blogs');
    expect(query.mock.calls[3][0]).toContain('AND id <> $2');
    expect(query.mock.calls[4][0]).toContain('UPDATE blogs');
    expect(query.mock.calls[5][0]).toContain('SET published = $1');
    expect(query.mock.calls[6][1]).toEqual([false, '7']);
    expect(query.mock.calls[7][0]).toContain('DELETE FROM blogs');
  });

  it('returns 409 when creating a blog with a duplicate slug', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

    const response = await request(app)
      .post('/api/admin/blogs')
      .set(adminHeaders)
      .send(blogPayload);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'Slug already exists' });
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('returns 409 when creating a blog hits the slug unique constraint', async () => {
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockRejectedValueOnce({
        code: '23505',
        constraint: 'blogs_slug_key'
      });

    const response = await request(app)
      .post('/api/admin/blogs')
      .set(adminHeaders)
      .send(blogPayload);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'Slug already exists' });
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[1][0]).toContain('INSERT INTO blogs');
  });

  it('returns 409 when updating a blog hits the slug unique constraint', async () => {
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockRejectedValueOnce({
        code: '23505',
        constraint: 'blogs_slug_key'
      });

    const response = await request(app)
      .put('/api/admin/blogs/7')
      .set(adminHeaders)
      .send({ ...blogPayload, slug: 'admin-blog-updated' });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'Slug already exists' });
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[1][0]).toContain('UPDATE blogs');
  });

  it('rejects invalid admin blog IDs before querying', async () => {
    const readResponse = await request(app)
      .get('/api/admin/blogs/not-a-number')
      .set(adminHeaders);
    const updateResponse = await request(app)
      .put('/api/admin/blogs/not-a-number')
      .set(adminHeaders)
      .send(blogPayload);
    const publishResponse = await request(app)
      .patch('/api/admin/blogs/not-a-number/publish')
      .set(adminHeaders)
      .send({ published: true });
    const deleteResponse = await request(app)
      .delete('/api/admin/blogs/not-a-number')
      .set(adminHeaders);

    expect(readResponse.status).toBe(400);
    expect(updateResponse.status).toBe(400);
    expect(publishResponse.status).toBe(400);
    expect(deleteResponse.status).toBe(400);
    expect(readResponse.body).toEqual({ error: 'Invalid id' });
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects out-of-range admin blog IDs before querying', async () => {
    const response = await request(app)
      .get('/api/admin/blogs/9223372036854775808')
      .set(adminHeaders);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid id' });
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects more than six additional image URLs before inserting', async () => {
    const response = await request(app)
      .post('/api/admin/blogs')
      .set(adminHeaders)
      .send({
        ...blogPayload,
        image_urls: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg']
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Image urls cannot contain more than 6 items when a cover image is included'
    });
    expect(query).not.toHaveBeenCalled();
  });

  it('approves a pending comment and rejects a previously approved comment', async () => {
    query
      .mockResolvedValueOnce({
        rows: [
          {
            id: '3',
            blog_id: '7',
            sender_name: 'Mali',
            message: thaiGreeting,
            status: 'approved'
          }
        ]
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: '3',
            blog_id: '7',
            sender_name: 'Mali',
            message: thaiGreeting,
            status: 'rejected'
          }
        ]
      });

    const approveResponse = await request(app)
      .patch('/api/admin/comments/3/status')
      .set(adminHeaders)
      .send({ status: 'approved' });
    const rejectResponse = await request(app)
      .patch('/api/admin/comments/3/status')
      .set(adminHeaders)
      .send({ status: 'rejected' });

    expect(approveResponse.status).toBe(200);
    expect(rejectResponse.status).toBe(200);
    expect(approveResponse.body.data.status).toBe('approved');
    expect(rejectResponse.body.data.status).toBe('rejected');
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0]).toContain('UPDATE comments');
    expect(query.mock.calls[0][1]).toEqual(['approved', '3']);
    expect(query.mock.calls[1][1]).toEqual(['rejected', '3']);
  });

  it('rejects invalid admin comment IDs before querying', async () => {
    const response = await request(app)
      .patch('/api/admin/comments/not-a-number/status')
      .set(adminHeaders)
      .send({ status: 'approved' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid id' });
    expect(query).not.toHaveBeenCalled();
  });

  it('lists comments for moderation with blog titles', async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          id: '3',
          blog_id: '7',
          blog_title: 'Admin Blog',
          sender_name: 'Mali',
          message: thaiGreeting,
          status: 'pending',
          created_at: '2026-06-19T01:00:00.000Z'
        }
      ]
    });

    const response = await request(app)
      .get('/api/admin/comments')
      .set(adminHeaders);

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      blog_title: 'Admin Blog',
      sender_name: 'Mali',
      message: thaiGreeting,
      status: 'pending'
    });
    expect(query).toHaveBeenCalledWith(expect.stringContaining('JOIN blogs'), []);
    expect(query.mock.calls[0][0]).toContain('ORDER BY comments.created_at DESC');
  });
});
