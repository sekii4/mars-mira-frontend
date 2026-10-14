import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/participant/DashboardPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SettingsPage } from './pages/SettingsPage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminRoutePage } from './pages/admin/AdminRoutePage';
import { RouteMapPage } from './pages/participant/RouteMapPage';
import { GroupsPage } from './pages/admin/GroupsPage';
import { ParticipantsPage } from './pages/admin/ParticipantsPage';
import { AdminLiveMapPage } from './pages/admin/AdminLiveMapPage';
import { EventsPage } from './pages/admin/EventsPage';

import './App.css';

function RootRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
}

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen flex flex-col w-full bg-background text-foreground">
              <Navbar />
              <main className="flex-1 flex flex-col w-full">
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route path="/register" element={<Navigate to="/auth?tab=register" replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['participant']}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['participant']}>
                    <Navigate to="/settings?tab=profile" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/statistics"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin/stats" element={<Navigate to="/admin" replace />} />
              <Route
                path="/admin/participants"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ParticipantsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/groups"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <GroupsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/route"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminRoutePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/live-map"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLiveMapPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin/live" element={<Navigate to="/admin/live-map" replace />} />
              <Route
                path="/map"
                element={
                  <ProtectedRoute allowedRoles={['participant']}>
                    <RouteMapPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/postavke" element={<Navigate to="/settings" replace />} />
              <Route path="/ruta" element={<Navigate to="/map" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  </LanguageProvider>
</ThemeProvider>
  );
}

export default App;
