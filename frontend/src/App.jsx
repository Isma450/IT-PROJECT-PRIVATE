import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ResetPassword from './components/auth/ResetPassword'
import ResetPasswordConfirm from './components/auth/ResetPasswordConfirm'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-gray-800">
          <Navbar />
          <main className="container mx-auto px-4 py-8 max-w-6xl">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password/:token" element={<ResetPasswordConfirm />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
                {/* Autres routes protégées */}
              </Route>
              
              <Route element={<AdminRoute />}>
                <Route path="/create-post" element={<CreatePost />} />
              </Route>
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
