
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, UserRole } from './types';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AttendanceSession from './pages/AttendanceSession';
import Sidebar from './components/Sidebar';
import { Toaster, toast } from 'react-hot-toast';

// Fixed: Moved ProtectedRoute outside of App to resolve JSX children typing issues and avoid re-creation on every render.
// Added children?: React.ReactNode to the props type to ensure compatibility with React 18+.
const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  user 
}: { 
  children?: React.ReactNode, 
  allowedRoles: UserRole[], 
  user: User | null 
}) => {
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Simple local storage persistence simulation
  useEffect(() => {
    const savedUser = localStorage.getItem('omni_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('omni_user', JSON.stringify(userData));
    toast.success(`Welcome back, ${userData.name}!`);
    
    // Redirect based on role
    if (userData.role === UserRole.ADMIN) navigate('/admin');
    else if (userData.role === UserRole.TEACHER) navigate('/teacher');
    else navigate('/student');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('omni_user');
    navigate('/login');
    toast.success("Logged out successfully");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {user && location.pathname !== '/login' && (
        <Sidebar user={user} onLogout={handleLogout} />
      )}
      
      <main className={`flex-1 overflow-auto ${user && location.pathname !== '/login' ? 'md:ml-64' : ''}`}>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]} user={user}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={[UserRole.TEACHER]} user={user}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />

          <Route path="/student" element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]} user={user}>
              <StudentDashboard user={user!} />
            </ProtectedRoute>
          } />

          <Route path="/session/:id" element={
            <ProtectedRoute allowedRoles={[UserRole.TEACHER, UserRole.STUDENT]} user={user}>
              <AttendanceSession user={user!} />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to={user ? `/${user.role.toLowerCase()}` : "/login"} replace />} />
          <Route path="*" element={<div className="flex items-center justify-center h-full">404 Not Found</div>} />
        </Routes>
      </main>
      
      {/* Portals and Toasts */}
      <div id="toast-container" className="fixed top-4 right-4 z-[9999]"></div>
      <Toaster />
    </div>
  );
};

export default App;
