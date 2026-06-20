import { useEffect, useMemo, useState } from 'react';
import {
  createAdminBlog,
  deleteAdminBlog,
  getAdminBlogs,
  publishAdminBlog,
  updateAdminBlog
} from '../api.js';
import Pagination from '../components/Pagination.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { BlogCardSkeleton } from '../components/Skeleton.jsx';

const PAGE_SIZE = 10;

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image_url: '',
  image_urls_text: ''
};

function toForm(blog) {
  return {
    title: blog.title || '',
    slug: blog.slug || '',
    excerpt: blog.excerpt || '',
    content: blog.content || '',
    cover_image_url: blog.cover_image_url || '',
    image_urls_text: Array.isArray(blog.image_urls) ? blog.image_urls.join('\n') : ''
  };
}

function parseImageUrls(text) {
  return text
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const additionalImageCount = useMemo(
    () => parseImageUrls(form.image_urls_text).length,
    [form.image_urls_text]
  );
  const filteredBlogs = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return blogs;
    }

    return blogs.filter((blog) =>
      `${blog.title || ''} ${blog.slug || ''}`.toLowerCase().includes(keyword)
    );
  }, [blogs, searchTerm]);
  const totalPages = Math.ceil(filteredBlogs.length / PAGE_SIZE);
  const visibleBlogs = filteredBlogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  async function loadBlogs() {
    setLoading(true);
    setError('');

    try {
      const payload = await getAdminBlogs();
      setBlogs(payload.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlogs();
  }, []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startCreate() {
    setSelectedBlog(null);
    setForm(emptyForm);
    setNotice('');
    setError('');
  }

  function startEdit(blog) {
    setSelectedBlog(blog);
    setForm(toForm(blog));
    setNotice('');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    const imageUrls = parseImageUrls(form.image_urls_text);

    if (imageUrls.length > 6) {
      setSaving(false);
      setError('Additional images cannot exceed 6 because the cover counts as image 1.');
      return;
    }

    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      cover_image_url: form.cover_image_url,
      image_urls: imageUrls
    };

    try {
      const result = selectedBlog
        ? await updateAdminBlog(selectedBlog.id, payload)
        : await createAdminBlog(payload);
      setSelectedBlog(result.data);
      setForm(toForm(result.data));
      setNotice(selectedBlog ? 'Blog updated.' : 'Blog created.');
      await loadBlogs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(blog, published) {
    setError('');
    setNotice('');

    try {
      await publishAdminBlog(blog.id, published);
      setNotice(published ? 'Blog published.' : 'Blog unpublished.');
      await loadBlogs();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(blog) {
    const confirmed = window.confirm(`Delete "${blog.title}"?`);

    if (!confirmed) {
      return;
    }

    setError('');
    setNotice('');

    try {
      await deleteAdminBlog(blog.id);
      if (selectedBlog?.id === blog.id) {
        startCreate();
      }
      setNotice('Blog deleted.');
      await loadBlogs();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-grid">
      <section className="admin-panel" aria-labelledby="blog-form-title">
        <div className="admin-panel__header">
          <h2 id="blog-form-title">{selectedBlog ? 'Edit Blog' : 'Create Blog'}</h2>
          <button type="button" className="button-secondary" onClick={startCreate}>
            New
          </button>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="blog-title">Title</label>
              <input
                id="blog-title"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="blog-slug">Slug</label>
              <input
                id="blog-slug"
                value={form.slug}
                onChange={(event) => updateField('slug', event.target.value)}
                placeholder="my-blog-post"
              />
            </div>
          </div>

          <label htmlFor="blog-excerpt">Excerpt</label>
          <textarea
            id="blog-excerpt"
            value={form.excerpt}
            onChange={(event) => updateField('excerpt', event.target.value)}
            rows="3"
          />

          <label htmlFor="blog-content">Content</label>
          <textarea
            id="blog-content"
            value={form.content}
            onChange={(event) => updateField('content', event.target.value)}
            rows="8"
          />

          <div className="form-field">
            <label htmlFor="blog-cover">Cover image URL</label>
            <input
              id="blog-cover"
              value={form.cover_image_url}
              onChange={(event) => updateField('cover_image_url', event.target.value)}
            />
          </div>

          <label htmlFor="blog-images">Additional image URLs</label>
          <textarea
            id="blog-images"
            value={form.image_urls_text}
            onChange={(event) => updateField('image_urls_text', event.target.value)}
            rows="5"
            placeholder="One URL per line"
          />
          <p className="field-help">{additionalImageCount}/6 additional images</p>

          {error ? <div className="notice notice--error">{error}</div> : null}
          {notice ? <div className="notice notice--success">{notice}</div> : null}

          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : selectedBlog ? 'Update Blog' : 'Create Blog'}
          </button>
        </form>
      </section>

      <section className="admin-panel" aria-labelledby="blog-table-title">
        <div className="admin-panel__header">
          <h2 id="blog-table-title">Blogs</h2>
          <span className="muted">
            {filteredBlogs.length} of {blogs.length} items
          </span>
        </div>

        <div className="admin-tools">
          <label htmlFor="admin-blog-search">Search blogs</label>
          <input
            id="admin-blog-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search title or slug"
          />
        </div>

        {loading ? (
          <div className="admin-loading">
            <BlogCardSkeleton />
            <BlogCardSkeleton />
          </div>
        ) : filteredBlogs.length ? (
          <>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBlogs.map((blog) => (
                    <tr key={blog.id}>
                      <td>{blog.title}</td>
                      <td>{blog.slug}</td>
                      <td>
                        <StatusBadge status={blog.published ? 'published' : 'draft'} />
                      </td>
                      <td>{blog.view_count ?? 0}</td>
                      <td>
                        <div className="table-actions">
                          <button type="button" className="button-secondary" onClick={() => startEdit(blog)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="button-secondary"
                            onClick={() => handlePublish(blog, !blog.published)}
                          >
                            {blog.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button type="button" className="button-danger" onClick={() => handleDelete(blog)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        ) : (
          <div className="empty-state">
            <h2>{blogs.length ? 'No matching blogs' : 'No blogs yet'}</h2>
            <p>{blogs.length ? 'Try a different title or slug.' : 'Create the first blog from the form.'}</p>
          </div>
        )}
      </section>
    </div>
  );
}
