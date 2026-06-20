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

function authHeaders() {
  const token = window.localStorage.getItem('blog_admin_token');

  return token ? { Authorization: `Bearer ${token}` } : {};
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

export async function loginAdmin({ username, password }) {
  return parseJsonResponse(
    await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
  );
}

export async function getAdminBlogs() {
  return parseJsonResponse(
    await fetch(`${API_BASE_URL}/api/admin/blogs`, {
      headers: authHeaders()
    })
  );
}

export async function createAdminBlog(blog) {
  return parseJsonResponse(
    await fetch(`${API_BASE_URL}/api/admin/blogs`, {
      method: 'POST',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(blog)
    })
  );
}

export async function updateAdminBlog(id, blog) {
  return parseJsonResponse(
    await fetch(`${API_BASE_URL}/api/admin/blogs/${id}`, {
      method: 'PUT',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(blog)
    })
  );
}

export async function publishAdminBlog(id, published) {
  return parseJsonResponse(
    await fetch(`${API_BASE_URL}/api/admin/blogs/${id}/publish`, {
      method: 'PATCH',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ published })
    })
  );
}

export async function deleteAdminBlog(id) {
  const response = await fetch(`${API_BASE_URL}/api/admin/blogs/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });

  if (response.status === 204) {
    return null;
  }

  return parseJsonResponse(response);
}

export async function getAdminComments() {
  return parseJsonResponse(
    await fetch(`${API_BASE_URL}/api/admin/comments`, {
      headers: authHeaders()
    })
  );
}

export async function updateCommentStatus(id, status) {
  return parseJsonResponse(
    await fetch(`${API_BASE_URL}/api/admin/comments/${id}/status`, {
      method: 'PATCH',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })
  );
}
