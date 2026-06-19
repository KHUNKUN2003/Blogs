import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink className="brand" to="/">
          Blog System
        </NavLink>
        <nav className="site-nav" aria-label="Primary navigation">
          <NavLink to="/">Public Blog</NavLink>
          <NavLink to="/admin/login">Admin</NavLink>
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
