import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../src/app.js';
import { query } from '../src/db.js';

vi.mock('../src/db.js', () => ({
  query: vi.fn()
}));

const thaiGreeting = '\u0e2a\u0e27\u0e31\u0e2a\u0e14\u0e35';
const thaiNumericMessage = `${thaiGreeting} 123`;

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
