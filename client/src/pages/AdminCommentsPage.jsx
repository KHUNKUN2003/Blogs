import { useEffect, useState } from 'react';
import { getAdminComments, updateCommentStatus } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { SkeletonBlock } from '../components/Skeleton.jsx';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadComments() {
    setLoading(true);
    setError('');

    try {
      const payload = await getAdminComments();
      setComments(payload.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, []);

  async function handleStatus(comment, status) {
    setError('');
    setNotice('');

    try {
      await updateCommentStatus(comment.id, status);
      setNotice(status === 'approved' ? 'Comment approved.' : 'Comment rejected.');
      await loadComments();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="admin-panel" aria-labelledby="comments-admin-title">
      <div className="admin-panel__header">
        <h2 id="comments-admin-title">Comments</h2>
        <span className="muted">{comments.length} submitted</span>
      </div>

      {error ? <div className="notice notice--error">{error}</div> : null}
      {notice ? <div className="notice notice--success">{notice}</div> : null}

      {loading ? (
        <div className="admin-loading">
          <SkeletonBlock className="skeleton-line skeleton-line--wide" />
          <SkeletonBlock className="skeleton-line skeleton-line--wide" />
          <SkeletonBlock className="skeleton-line skeleton-line--wide" />
        </div>
      ) : comments.length ? (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Blog</th>
                <th>Sender</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id}>
                  <td>{comment.blog_title}</td>
                  <td>{comment.sender_name}</td>
                  <td>{comment.message}</td>
                  <td>
                    <StatusBadge status={comment.status} />
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => handleStatus(comment, 'approved')}
                        disabled={comment.status === 'approved'}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="button-danger"
                        onClick={() => handleStatus(comment, 'rejected')}
                        disabled={comment.status === 'rejected'}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h2>No comments</h2>
          <p>New comments will appear here before they are shown publicly.</p>
        </div>
      )}
    </section>
  );
}
