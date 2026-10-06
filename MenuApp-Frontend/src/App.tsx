import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './context/authStore';
import { HAS_BACKEND } from './api/axios';
import { demoUser } from './api/demo';

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
  if (!token) return HAS_BACKEND ? <Navigate to="/admin/login" replace /> : <DemoEnter rol={rol} />;
  return <>{children}</>;
};

const DemoEnter = ({ rol }: { rol: 'owner' | 'mozo' }) => {
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  useEffect(() => {
    if (!HAS_BACKEND) {
      login(demoUser(rol) as any, 'demo');
      navigate(rol === 'mozo' ? '/mozo/dashboard' : '/admin/dashboard', { replace: true });
    } else {
      navigate('/admin/login', { replace: true });
    }
  }, [rol, login, navigate]);

  return <PageLoader />;
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

          <Route path="/admin/login" element={HAS_BACKEND ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/caja" element={<DemoEnter rol="owner" />} />
          <Route path="/mozo" element={<DemoEnter rol="mozo" />} />
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
