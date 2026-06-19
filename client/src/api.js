const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

function getErrorMessage(payload) {
  if (typeof payload?.error === 'string') {
    return payload.error;
  }

  return payload?.error?.message || payload?.message || 'Request failed';
}

async function parseJsonResponse(response) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = getErrorMessage(payload);
    throw new Error(message);
  }

  return payload;
}

export async function getBlogs({ search = '', page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  if (search.trim()) {
    params.set('search', search.trim());
  }

  return parseJsonResponse(await fetch(`${API_BASE_URL}/api/blogs?${params}`));
}

export async function getBlog(slug) {
  return parseJsonResponse(await fetch(`${API_BASE_URL}/api/blogs/${slug}`));
}

export async function submitComment(slug, { sender_name, message }) {
  return parseJsonResponse(
    await fetch(`${API_BASE_URL}/api/blogs/${slug}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sender_name, message })
    })
  );
}
