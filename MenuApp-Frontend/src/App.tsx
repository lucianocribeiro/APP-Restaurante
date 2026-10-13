import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './context/authStore';
import { HAS_BACKEND } from './api/axios';

const Menu = lazy(() => import('./pages/Menu'));
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const OrderStatus = lazy(() => import('./pages/OrderStatus'));
const DemoLinks = lazy(() => import('./pages/DemoLinks'));
const MozoDashboard = lazy(() => import('./pages/MozoDashboard'));

const PageLoader = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children, rol }: { children: React.ReactNode; rol: 'owner' | 'mozo' }) => {
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Mozo cannot access owner (Admin) panel
  if (rol === 'owner' && user?.rol === 'mozo') {
    return <Navigate to="/mozo/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={HAS_BACKEND ? <Navigate to="/m/entrepanes" replace /> : <DemoLinks />} />
          <Route path="/demo" element={<DemoLinks />} />

          <Route path="/m/:slug" element={<Menu />} />
          <Route path="/status/:orderId" element={<OrderStatus />} />

          <Route path="/admin/login" element={<Login />} />
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/caja" element={<Navigate to="/admin/login" replace />} />
          <Route path="/mozo" element={<Navigate to="/admin/login" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute rol="owner">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mozo/dashboard"
            element={
              <ProtectedRoute rol="mozo">
                <MozoDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
