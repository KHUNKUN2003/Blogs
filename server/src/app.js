import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { requireAdminAuth } from './middleware/auth.js';
import adminAuthRouter from './routes/adminAuth.js';
import adminBlogsRouter from './routes/adminBlogs.js';
import adminCommentsRouter from './routes/adminComments.js';
import publicBlogsRouter from './routes/publicBlogs.js';

const app = express();

app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: '6mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/blogs', publicBlogsRouter);
app.use('/api/admin', adminAuthRouter);
app.use('/api/admin/blogs', requireAdminAuth, adminBlogsRouter);
app.use('/api/admin/comments', requireAdminAuth, adminCommentsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  const rawStatus = err.statusCode ?? err.status ?? 500;
  const status =
    Number.isInteger(rawStatus) && rawStatus >= 400 && rawStatus <= 599
      ? rawStatus
      : 500;
  const message =
    err.expose === true
      ? err.message
      : status < 500
        ? 'Bad request'
        : 'Internal server error';

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
});

export default app;
