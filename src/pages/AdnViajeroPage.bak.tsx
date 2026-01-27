import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';

// Pages
import { LandingPage } from '@/pages/LandingPage';
import { AdnViajeroPage } from '@/pages/AdnViajeroPage';
import { ExplorePage } from '@/pages/ExplorePage';
import { ActivityDetailPage } from '@/pages/ActivityDetailPage';
import { ItineraryPage } from '@/pages/ItineraryPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { CheckoutSuccessPage } from '@/pages/CheckoutSuccessPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { PartnerDashboardPage } from '@/pages/PartnerDashboardPage';
import { TermsPage } from '@/pages/legal/TermsPage';
import { PrivacyPage } from '@/pages/legal/PrivacyPage';
import { ConsumerPage } from '@/pages/legal/ConsumerPage';

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

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><LandingPage /></Layout>} />
          <Route path="/adn-viajero" element={<Layout showFooter={false}><AdnViajeroPage /></Layout>} />
          <Route path="/explore" element={<Layout><ExplorePage /></Layout>} />
          <Route path="/actividad/:id" element={<Layout><ActivityDetailPage /></Layout>} />
          <Route path="/itinerario/:id" element={<Layout><ItineraryPage /></Layout>} />
          
          {/* Checkout Routes */}
          <Route path="/checkout" element={<Layout showFooter={false}><CheckoutPage /></Layout>} />
          <Route path="/checkout/success" element={<MinimalLayout><CheckoutSuccessPage /></MinimalLayout>} />
          
          {/* User Routes */}
          <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
          
          {/* Partner Routes */}
          <Route path="/partner/dashboard" element={<Layout showFooter={false}><PartnerDashboardPage /></Layout>} />
          
          {/* Legal Routes */}
          <Route path="/legal/terminos" element={<Layout><TermsPage /></Layout>} />
          <Route path="/legal/privacidad" element={<Layout><PrivacyPage /></Layout>} />
          <Route path="/legal/consumidor" element={<Layout><ConsumerPage /></Layout>} />
          
          {/* Fallback */}
          <Route path="*" element={<Layout><LandingPage /></Layout>} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
