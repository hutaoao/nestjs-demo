import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import UsersPage from './pages/users/UsersPage'
import PostsPage from './pages/posts/PostsPage'
import TagsPage from './pages/tags/TagsPage'
import FilesPage from './pages/files/FilesPage'
import DynamicConfigPage from './pages/dynamic-config/DynamicConfigPage'

export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/dynamic-config" element={<DynamicConfigPage />} />
            <Route path="/" element={<Navigate to="/users" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}
