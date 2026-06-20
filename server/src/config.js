import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const port = Number(process.env.PORT ?? 4000);
const defaultAdminUsername = 'admin';
const defaultAdminPassword = 'admin123';
const defaultAdminToken = 'dev-admin-token-change-me';
const productionAdminEnv = {
  ADMIN_USERNAME: process.env.ADMIN_USERNAME?.trim(),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD?.trim(),
  ADMIN_TOKEN: process.env.ADMIN_TOKEN?.trim()
};
const minimumAdminEnvLengths = {
  ADMIN_PASSWORD: 12,
  ADMIN_TOKEN: 16
};

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

if (process.env.NODE_ENV === 'production') {
  const unsafeAdminEnv = [
    ['ADMIN_USERNAME', defaultAdminUsername],
    ['ADMIN_PASSWORD', defaultAdminPassword],
    ['ADMIN_TOKEN', defaultAdminToken]
  ].filter(([name, defaultValue]) => {
    const value = productionAdminEnv[name];
    return (
      value === undefined ||
      value.length === 0 ||
      value === defaultValue ||
      value.length < (minimumAdminEnvLengths[name] ?? 1)
    );
  });

  if (unsafeAdminEnv.length > 0) {
    throw new Error(
      `Production admin configuration requires non-empty, non-default values with secure password/token lengths for ${unsafeAdminEnv
        .map(([name]) => name)
        .join(', ')}`
    );
  }
}

export const config = {
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgres://blog_user:blog_password@localhost:5433/blog_system',
  port,
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  adminUsername: productionAdminEnv.ADMIN_USERNAME ?? defaultAdminUsername,
  adminPassword: productionAdminEnv.ADMIN_PASSWORD ?? defaultAdminPassword,
  adminToken: productionAdminEnv.ADMIN_TOKEN ?? defaultAdminToken
};
