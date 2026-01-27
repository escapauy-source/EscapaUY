import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import { LandingPage } from '@/pages/LandingPage';
import { AdnViajeroPage } from '@/pages/AdnViajeroPage';
import { ExplorePage } from '@/pages/ExplorePage';
import { ItineraryBuilderPage } from '@/pages/ItineraryBuilderPage';
import { ActivityDetailPage } from '@/pages/ActivityDetailPage';
import { ItineraryPage } from '@/pages/ItineraryPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { CheckoutSuccessPage } from '@/pages/CheckoutSuccessPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { PartnerDashboardPage } from '@/pages/PartnerDashboardPage';
import { DebugPartnerPage } from '@/pages/DebugPartnerPage';
import { TermsPage } from '@/pages/legal/TermsPage';
import { PrivacyPage } from '@/pages/legal/PrivacyPage';
import { ConsumerPage } from '@/pages/legal/ConsumerPage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { AdminBlogPage } from '@/pages/AdminBlogPage';
import { AdminContentEnginePage } from '@/pages/AdminContentEnginePage';
import { BlogListPage } from '@/pages/BlogListPage';
import { BlogPostPage } from '@/pages/BlogPostPage';
import { Shield } from 'lucide-react';

import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

// Layout component
function Layout({ children, showFooter = true }: { children: React.ReactNode; showFooter?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
      <AuthModal />
    </div>
  );
}

// Layout for pages without header (like checkout success)
function MinimalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-inter">
      {children}
      <AuthModal />
    </div>
  );
}

// Guard for Admin Routes
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useApp();
  const location = useLocation();

  // Verificación estricta: SOLO este correo electrónico puede acceder a la Torre de Control
  const isAdmin = isAuthenticated && user?.email === 'escapauy@gmail.com';

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
            <Shield className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 max-w-md mb-8">
            Lo sentimos, esta sección está restringida solo para el personal autorizado de EscapaUY (Torre de Control).
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-[#2D2D2D] text-white rounded-full font-bold hover:bg-black transition-all"
          >
            Volver al Inicio
          </button>
        </div>
      </Layout>
    );
  }

  return <>{children}</>;
}

export function App() {
  console.log('[DEBUG] App rendering...');
  return (
    <BrowserRouter>
      <AppProvider>
        <ErrorBoundary>
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><LandingPage /></Layout>} />

            {/* Critical Routes with Error Boundaries */}
            <Route
              path="/adn-viajero"
              element={
                <Layout showFooter={false}>
                  <ErrorBoundary>
                    <AdnViajeroPage />
                  </ErrorBoundary>
                </Layout>
              }
            />

            <Route path="/explore" element={<Layout><ExplorePage /></Layout>} />

            <Route
              path="/itinerary-builder"
              element={
                <Layout showFooter={false}>
                  <ErrorBoundary>
                    <ItineraryBuilderPage />
                  </ErrorBoundary>
                </Layout>
              }
            />

            <Route path="/actividad/:id" element={<Layout><ActivityDetailPage /></Layout>} />
            <Route path="/itinerario/:id" element={<Layout><ItineraryPage /></Layout>} />

            {/* Checkout Routes with Error Boundary */}
            <Route
              path="/checkout"
              element={
                <Layout showFooter={false}>
                  <ErrorBoundary>
                    <CheckoutPage />
                  </ErrorBoundary>
                </Layout>
              }
            />
            <Route path="/checkout/success" element={<MinimalLayout><CheckoutSuccessPage /></MinimalLayout>} />

            {/* User Routes */}
            <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />

            {/* Partner Routes */}
            {/* DEBUG: Development bypass - removes authentication */}
            <Route path="/debug-partner" element={<MinimalLayout><DebugPartnerPage /></MinimalLayout>} />
            <Route path="/partner/dashboard" element={<Layout showFooter={false}><PartnerDashboardPage /></Layout>} />

            {/* Legal Routes */}
            <Route path="/legal/terminos" element={<Layout><TermsPage /></Layout>} />
            <Route path="/legal/privacidad" element={<Layout><PrivacyPage /></Layout>} />
            <Route path="/legal/consumidor" element={<Layout><ConsumerPage /></Layout>} />

            {/* Admin Routes */}
            <Route
              path="/admin/control-tower"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/blog"
              element={
                <AdminRoute>
                  <AdminBlogPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/content-engine"
              element={
                <AdminRoute>
                  <AdminContentEnginePage />
                </AdminRoute>
              }
            />

            {/* Blog Routes */}
            <Route path="/blog" element={<Layout><BlogListPage /></Layout>} />
            <Route path="/blog/:slug" element={<Layout><BlogPostPage /></Layout>} />

            {/* Fallback */}
            <Route path="*" element={<Layout><LandingPage /></Layout>} />
          </Routes>
        </ErrorBoundary>
      </AppProvider>
    </BrowserRouter>
  );
}
