import express from 'express';
import { config } from '../config.js';
import { exposedError } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username !== config.adminUsername || password !== config.adminPassword) {
    return next(exposedError(401, 'Invalid credentials'));
  }

  return res.json({ token: config.adminToken });
});

export default router;
