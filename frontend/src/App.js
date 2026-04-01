
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import Masters    from './pages/Masters';
import Applicants from './pages/Applicants';
import Admissions from './pages/Admissions';
import Navbar     from './components/Navbar';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}

      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/masters" element={
          <ProtectedRoute roles={['admin']}>
            <Masters />
          </ProtectedRoute>
        } />
        <Route path="/applicants" element={
          <ProtectedRoute roles={['admin', 'admission_officer']}>
            <Applicants />
          </ProtectedRoute>
        } />
        <Route path="/admissions" element={
          <ProtectedRoute roles={['admin', 'admission_officer']}>
            <Admissions />
          </ProtectedRoute>
        } />
        <Route path="*" element={
          <Navigate to={user ? '/dashboard' : '/login'} replace />
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
