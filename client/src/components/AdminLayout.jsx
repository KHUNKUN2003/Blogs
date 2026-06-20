import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { clearToken, isLoggedIn } from '../data/auth.js';

export default function AdminLayout() {
  const navigate = useNavigate();

  if (!isLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }

  function handleLogout() {
    clearToken();
    navigate('/admin/login', { replace: true });
  }

  return (
    <section className="admin-shell" aria-labelledby="admin-title">
      <aside className="admin-sidebar">
        <h1 id="admin-title">Admin Panel</h1>
        <nav className="admin-nav" aria-label="Admin navigation">
          <NavLink to="/admin" end>
            Blogs
          </NavLink>
          <NavLink to="/admin/comments">Comments</NavLink>
        </nav>
        <button type="button" className="button-secondary" onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </section>
  );
}
