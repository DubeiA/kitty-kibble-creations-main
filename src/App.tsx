import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import ProtectedRoute from './components/admin/AdminLogin';
import { lazy, Suspense } from 'react';
import { useSupabaseAuthCallback } from '@/hooks/useSupabaseAuthCallback';

const IndexPage = lazy(() => import('./pages/Index'));
const ShopPage = lazy(() => import('./pages/Shop'));
const CheckoutPage = lazy(() => import('./pages/Checkout'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccess'));
const AdminPage = lazy(() => import('./pages/Admin'));
const AuthPage = lazy(() => import('./pages/Auth'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient();

const App = () => {
  useSupabaseAuthCallback();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Suspense fallback={<div>Завантаження...</div>}>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/cart" element={<Navigate to="/checkout" replace />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="payment-success" element={<PaymentSuccessPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute onlyAdmin={true}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
