import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  isThaiNumericComment,
  validateImageUrls,
  validatePositiveIntegerId
} from '../src/utils/validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');

describe('validation helpers', () => {
  it('accepts comments containing Thai characters, digits, and whitespace', () => {
    expect(isThaiNumericComment('สวัสดี 123')).toBe(true);
  });

  it('rejects comments containing non-Thai letters', () => {
    expect(isThaiNumericComment('hello')).toBe(false);
  });

  it('allows up to seven image urls', () => {
    expect(validateImageUrls(['a', 'b', 'c', 'd', 'e', 'f', 'g']).valid).toBe(
      true
    );
  });

  it('rejects more than seven image urls', () => {
    expect(validateImageUrls(['1', '2', '3', '4', '5', '6', '7', '8']).valid).toBe(
      false
    );
  });

  it('rejects positive integer IDs above the PostgreSQL BIGINT range', () => {
    expect(validatePositiveIntegerId('9223372036854775807').valid).toBe(true);
    expect(validatePositiveIntegerId('9223372036854775808')).toEqual({
      valid: false,
      message: 'Invalid id'
    });
  });
});

describe('production config guard', () => {
  it('rejects empty admin credentials in production', () => {
    const result = spawnSync(
      process.execPath,
      ['--input-type=module', '--eval', "import('./src/config.js')"],
      {
        cwd: serverRoot,
        env: {
          ...process.env,
          NODE_ENV: 'production',
          ADMIN_USERNAME: '',
          ADMIN_PASSWORD: '',
          ADMIN_TOKEN: ''
        },
        encoding: 'utf8'
      }
    );

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      'Production admin configuration requires non-empty, non-default values with secure password/token lengths for ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_TOKEN'
    );
  });
});
