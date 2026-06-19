import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import BlogDetailPage from './pages/BlogDetailPage.jsx';
import BlogListPage from './pages/BlogListPage.jsx';

function AdminPlaceholder({ title }) {
  return (
    <section className="placeholder-page" aria-labelledby="placeholder-title">
      <p className="eyebrow">Task 6</p>
      <h1 id="placeholder-title">{title}</h1>
      <p>Admin interface placeholder for routing only.</p>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<BlogListPage />} />
        <Route path="blogs/:slug" element={<BlogDetailPage />} />
        <Route path="admin/login" element={<AdminPlaceholder title="Admin Login" />} />
        <Route path="admin" element={<AdminPlaceholder title="Admin Dashboard" />} />
        <Route path="admin/comments" element={<AdminPlaceholder title="Comment Moderation" />} />
      </Route>
    </Routes>
  );
}
