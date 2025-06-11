import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ResetPassword from './components/auth/ResetPassword'
import ResetPasswordConfirm from './components/auth/ResetPasswordConfirm'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import EditPost from './pages/EditPost'
import BlogCreations from './pages/BlogCreations'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import PostDetail from './components/posts/PostDetail'

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-100 dark:from-slate-900 dark:to-violet-900">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-6xl">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password/:token" element={<ResetPasswordConfirm />} />
                <Route path="/blog" element={<BlogCreations />} />
                <Route path="/posts/:id" element={<PostDetail />} />
                <Route path="/blog/:id" element={<PostDetail />} />

                
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  {/* Autres routes protégées */}
                </Route>
                
                <Route element={<AdminRoute />}>
                  <Route path="/create-post" element={<CreatePost />} />
                  <Route path="/blog/:id/edit" element={<EditPost />} />
                </Route>
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
