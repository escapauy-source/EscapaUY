import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FooterMVP } from '@/components/FooterMVP';
import { AuthModal } from '@/components/AuthModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import { LandingPage } from '@/pages/LandingPage';
import { LandingMVP } from '@/pages/LandingMVP';
import { WizardPage } from '@/pages/WizardPage';
import { ItinerarioSimuladoPage } from '@/pages/ItinerarioSimuladoPage';
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
import { ColoniaQuehacerPage } from '@/pages/seo/ColoniaQuehacerPage';
import { CarmeloBodegasPage } from '@/pages/seo/CarmeloBodegasPage';
import { EscapadaBuenosAiresPage } from '@/pages/seo/EscapadaBuenosAiresPage';
import { HotelesColoniaPage } from '@/pages/seo/HotelesColoniaPage';
import { EnoturismoUruguayPage } from '@/pages/seo/EnoturismoUruguayPage';
import { Shield } from 'lucide-react';

function Layout({ children, showFooter = true }: { children: React.ReactNode; showFooter?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
      <AuthModal />
    </div>
  );
}

function MinimalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-inter">
      {children}
      <AuthModal />
    </div>
  );
}

function MVPLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#1A1F2C' }}>
      <main className="flex-1">{children}</main>
      <FooterMVP />
    </div>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useApp();
  const location = useLocation();
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
            Esta sección está restringida para el personal autorizado de EscapaUY.
          </p>
          <button onClick={() => (window.location.href = '/')}
            className="px-8 py-3 bg-[#2D2D2D] text-white rounded-full font-bold hover:bg-black transition-all">
            Volver al Inicio
          </button>
        </div>
      </Layout>
    );
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useApp();
  const location = useLocation();
  console.log('[DEBUG] App rendering at:', location.pathname);
  if (user) console.log('[DEBUG] rol:', (user as any).role);

  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <Routes>
        {/* MVP Publico - Luxury Neo-Minimalism */}
        <Route path="/mvp" element={<MVPLayout><LandingMVP /></MVPLayout>} />
        <Route path="/wizard" element={<MVPLayout><WizardPage /></MVPLayout>} />
        <Route path="/itinerario-simulado" element={<MVPLayout><ItinerarioSimuladoPage /></MVPLayout>} />

        {/* Legal MVP */}
        <Route path="/terminos" element={<Layout><TermsPage /></Layout>} />
        <Route path="/privacidad" element={<Layout><PrivacyPage /></Layout>} />
        <Route path="/defensa-consumidor" element={<Layout><ConsumerPage /></Layout>} />

        {/* Sistema existente */}
        <Route path="/" element={<Layout><LandingPage /></Layout>} />
        <Route path="/adn-viajero" element={<Layout showFooter={false}><ErrorBoundary><AdnViajeroPage /></ErrorBoundary></Layout>} />
        <Route path="/explore" element={<Layout><ExplorePage /></Layout>} />
        <Route path="/itinerary-builder" element={<Layout showFooter={false}><ErrorBoundary><ItineraryBuilderPage /></ErrorBoundary></Layout>} />
        <Route path="/actividad/:id" element={<Layout><ActivityDetailPage /></Layout>} />
        <Route path="/itinerario/:id" element={<Layout><ItineraryPage /></Layout>} />
        <Route path="/checkout" element={<Layout showFooter={false}><ErrorBoundary><CheckoutPage /></ErrorBoundary></Layout>} />
        <Route path="/checkout/success" element={<MinimalLayout><CheckoutSuccessPage /></MinimalLayout>} />
        <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
        <Route path="/debug-partner" element={<MinimalLayout><DebugPartnerPage /></MinimalLayout>} />
        <Route path="/partner/dashboard" element={<Layout showFooter={false}><PartnerDashboardPage /></Layout>} />
        <Route path="/legal/terminos" element={<Layout><TermsPage /></Layout>} />
        <Route path="/legal/privacidad" element={<Layout><PrivacyPage /></Layout>} />
        <Route path="/legal/consumidor" element={<Layout><ConsumerPage /></Layout>} />
        <Route path="/admin/control-tower" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/blog" element={<AdminRoute><AdminBlogPage /></AdminRoute>} />
        <Route path="/admin/content-engine" element={<AdminRoute><AdminContentEnginePage /></AdminRoute>} />
        <Route path="/blog" element={<Layout><BlogListPage /></Layout>} />
        <Route path="/blog/:slug" element={<Layout><BlogPostPage /></Layout>} />

        {/* SEO Landing Pages */}
        <Route path="/colonia/que-hacer" element={<ColoniaQuehacerPage />} />
        <Route path="/carmelo/bodegas" element={<CarmeloBodegasPage />} />
        <Route path="/escapada-desde-buenos-aires" element={<EscapadaBuenosAiresPage />} />
        <Route path="/hoteles/colonia" element={<HotelesColoniaPage />} />
        <Route path="/experiencias/enoturismo-uruguay" element={<EnoturismoUruguayPage />} />

        <Route path="*" element={<Layout><LandingPage /></Layout>} />
      </Routes>
    </ErrorBoundary>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
