import { describe, expect, it } from 'vitest';
import {
  isThaiNumericComment,
  validateImageUrls
} from '../src/utils/validation.js';

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
});
