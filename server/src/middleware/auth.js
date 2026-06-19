import { config } from '../config.js';

export function exposedError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.expose = true;
  return error;
}

export function requireAdminAuth(req, _res, next) {
  const authorization = req.get('Authorization') ?? '';
  const expected = `Bearer ${config.adminToken}`;

  if (authorization !== expected) {
    return next(exposedError(401, 'Unauthorized'));
  }

  return next();
}
