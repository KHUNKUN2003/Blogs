import { useEffect, useState } from 'react';
import BlogCard from '../components/BlogCard.jsx';
import Pagination from '../components/Pagination.jsx';
import { BlogCardSkeleton } from '../components/Skeleton.jsx';
import { getBlogs } from '../api.js';

const PAGE_SIZE = 10;

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadBlogs() {
      setLoading(true);
      setError('');

      try {
        const payload = await getBlogs({ search, page, limit: PAGE_SIZE });

        if (active) {
          setBlogs(payload.data || []);
          setPagination(payload.pagination || { page, totalPages: 0, total: 0 });
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          setBlogs([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBlogs();

    return () => {
      active = false;
    };
  }, [search, page]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <section className="page-section" aria-labelledby="blog-list-title">
      <div className="page-heading">
        <div>
          <h1 id="blog-list-title">Latest Posts</h1>
        </div>
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <label htmlFor="blog-search">Search posts</label>
          <div className="search-form__controls">
            <input
              id="blog-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by blog title"
            />
            <button type="submit">Search</button>
          </div>
        </form>
      </div>

      {error ? <div className="notice notice--error">{error}</div> : null}

      {loading ? (
        <div className="blog-grid" aria-label="Loading blog posts">
          {Array.from({ length: 6 }, (_, index) => (
            <BlogCardSkeleton key={index} />
          ))}
        </div>
      ) : blogs.length > 0 ? (
        <>
          <div className="result-count">
            Showing {blogs.length} of {pagination.total} posts
          </div>
          <div className="blog-grid">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
          <Pagination
            page={pagination.page || page}
            totalPages={pagination.totalPages || 0}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="empty-state">
          <h2>No posts found</h2>
          <p>Try a different search term or check back when new posts are published.</p>
        </div>
      )}
    </section>
  );
}
