import { Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout.jsx';
import Layout from './components/Layout.jsx';
import AdminBlogsPage from './pages/AdminBlogsPage.jsx';
import AdminCommentsPage from './pages/AdminCommentsPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import BlogDetailPage from './pages/BlogDetailPage.jsx';
import BlogListPage from './pages/BlogListPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<BlogListPage />} />
        <Route path="blogs/:slug" element={<BlogDetailPage />} />
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminBlogsPage />} />
          <Route path="comments" element={<AdminCommentsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
