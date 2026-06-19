import { Link } from 'react-router-dom';

function formatDate(value) {
  if (!value) {
    return 'Unscheduled';
  }

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));
}

export default function BlogCard({ blog }) {
  return (
    <article className="blog-card">
      <Link className="blog-card__media" to={`/blogs/${blog.slug}`} aria-label={blog.title}>
        {blog.cover_image_url ? (
          <img src={blog.cover_image_url} alt="" loading="lazy" />
        ) : (
          <div className="image-fallback">No image</div>
        )}
      </Link>
      <div className="blog-card__body">
        <time className="meta" dateTime={blog.posted_at}>
          {formatDate(blog.posted_at)}
        </time>
        <h2>
          <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
        </h2>
        <p>{blog.excerpt}</p>
      </div>
    </article>
  );
}
