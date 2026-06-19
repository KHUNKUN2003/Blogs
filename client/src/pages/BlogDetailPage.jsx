import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBlog, submitComment } from '../api.js';
import { BlogDetailSkeleton } from '../components/Skeleton.jsx';

const THAI_NUMERIC_COMMENT_RE = /^[\u0E01-\u0E590-9\s]+$/;

function formatDate(value) {
  if (!value) {
    return 'Unscheduled';
  }

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(value));
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadBlog() {
      setLoading(true);
      setError('');

      try {
        const payload = await getBlog(slug);

        if (active) {
          setBlog(payload.data);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBlog();

    return () => {
      active = false;
    };
  }, [slug]);

  const additionalImages = useMemo(() => {
    if (!Array.isArray(blog?.image_urls)) {
      return [];
    }

    return blog.image_urls.filter((url) => url && url !== blog.cover_image_url);
  }, [blog]);

  async function handleCommentSubmit(event) {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');

    const trimmedSender = senderName.trim();
    const trimmedMessage = message.trim();

    if (!trimmedSender) {
      setFormError('Sender is required.');
      return;
    }

    if (!trimmedMessage) {
      setFormError('Message is required.');
      return;
    }

    if (!THAI_NUMERIC_COMMENT_RE.test(trimmedMessage)) {
      setFormError('Message must contain Thai characters, digits, or whitespace only.');
      return;
    }

    setSubmitting(true);

    try {
      await submitComment(slug, {
        sender_name: trimmedSender,
        message: trimmedMessage
      });
      setMessage('');
      setFormSuccess('Your comment is pending admin approval and will not appear immediately.');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <BlogDetailSkeleton />;
  }

  if (error) {
    return (
      <section className="page-section">
        <Link className="back-link" to="/">
          Back to posts
        </Link>
        <div className="notice notice--error">{error}</div>
      </section>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <article className="detail">
      <Link className="back-link" to="/">
        Back to posts
      </Link>

      {blog.cover_image_url ? (
        <img className="detail__cover" src={blog.cover_image_url} alt="" />
      ) : (
        <div className="detail__cover image-fallback">No image</div>
      )}

      <header className="detail__header">
        <time className="meta" dateTime={blog.posted_at}>
          {formatDate(blog.posted_at)}
        </time>
        <h1>{blog.title}</h1>
        <div className="detail__stats">{blog.view_count ?? 0} views</div>
      </header>

      <div className="prose">
        {(blog.content || '').split(/\n{2,}/).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {additionalImages.length > 0 ? (
        <section className="image-gallery" aria-label="Additional images">
          {additionalImages.map((url) => (
            <img key={url} src={url} alt="" loading="lazy" />
          ))}
        </section>
      ) : null}

      <section className="comments" aria-labelledby="comments-title">
        <h2 id="comments-title">Comments</h2>
        {blog.comments?.length ? (
          <div className="comment-list">
            {blog.comments.map((comment) => (
              <article className="comment" key={comment.id}>
                <div className="comment__header">
                  <strong>{comment.sender_name}</strong>
                  <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>
                </div>
                <p>{comment.message}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">No approved comments yet.</p>
        )}
      </section>

      <section className="comment-form-section" aria-labelledby="comment-form-title">
        <h2 id="comment-form-title">Leave a Comment</h2>
        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <label htmlFor="sender-name">Name</label>
          <input
            id="sender-name"
            value={senderName}
            onChange={(event) => setSenderName(event.target.value)}
            autoComplete="name"
          />

          <label htmlFor="comment-message">Message</label>
          <textarea
            id="comment-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows="5"
          />

          {formError ? <div className="notice notice--error">{formError}</div> : null}
          {formSuccess ? <div className="notice notice--success">{formSuccess}</div> : null}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Comment'}
          </button>
        </form>
      </section>
    </article>
  );
}
