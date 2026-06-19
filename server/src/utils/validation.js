export const THAI_NUMERIC_COMMENT_RE = /^[\u0E01-\u0E590-9\s]+$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_IMAGE_URLS = 7;

export function isThaiNumericComment(value) {
  return typeof value === 'string' && THAI_NUMERIC_COMMENT_RE.test(value);
}

export function validateRequiredString(value, fieldName = 'Value') {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return {
      valid: false,
      message: `${fieldName} is required`
    };
  }

  return {
    valid: true,
    value: value.trim()
  };
}

export function validateSlug(value) {
  const required = validateRequiredString(value, 'Slug');

  if (!required.valid) {
    return required;
  }

  if (!SLUG_RE.test(required.value)) {
    return {
      valid: false,
      message: 'Slug must contain lowercase letters, numbers, and hyphens only'
    };
  }

  return {
    valid: true,
    value: required.value
  };
}

export function validateImageUrls(value) {
  if (!Array.isArray(value)) {
    return {
      valid: false,
      message: 'Image urls must be an array'
    };
  }

  if (value.length > MAX_IMAGE_URLS) {
    return {
      valid: false,
      message: `Image urls cannot contain more than ${MAX_IMAGE_URLS} items`
    };
  }

  const invalidItem = value.find(
    (item) => typeof item !== 'string' || item.trim().length === 0
  );

  if (invalidItem !== undefined) {
    return {
      valid: false,
      message: 'Image urls must be non-empty strings'
    };
  }

  return {
    valid: true,
    value: value.map((item) => item.trim())
  };
}
