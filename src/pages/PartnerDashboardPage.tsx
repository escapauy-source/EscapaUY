import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { usePartnerData } from '@/hooks/usePartnerData';
import {
  BarChart3, Settings, FileText, QrCode, Store, LogOut, Loader2,
  AlertCircle
} from 'lucide-react';
import { CatalogManager } from '@/components/partner/CatalogManager';
import { VoucherQRScanner } from '@/components/partner/VoucherQRScanner';
import { PartnerLegalConfig } from '@/components/partner/PartnerLegalConfig';
import { AvailabilityScheduler } from '@/components/partner/AvailabilityScheduler';

type ActiveTab = 'dashboard' | 'reservas' | 'vidriera' | 'qr' | 'configuracion';

// Fallback partner ID for debug mode
const DEBUG_PARTNER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export function PartnerDashboardPage() {
  const { user, logout } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('reservas'); // Iniciamos en Reservas por defecto

  // Use real partner data from Supabase
  const partnerId = user?.id || DEBUG_PARTNER_ID;
  const { partner, loading, error, updatePartner } = usePartnerData(partnerId);

  // Manejo de guardado de disponibilidad
  const handleSaveAvailability = async (settings: any) => {
    try {
      const { error: updateError } = await updatePartner({
        availability_settings: settings
      });
      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error saving availability:', err);
    }
  };

  // Wrap renderTabContent with error handling
  const SafeRenderTabContent = () => {
    try {
      return renderTabContent();
    } catch (err) {
      console.error('[PartnerDashboard] Render error:', err);
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-12 text-center max-w-2xl mx-auto">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 mb-2">Algo salió mal al cargar esta sección</h2>
          <p className="text-red-700 mb-6 font-medium">
            Hubo un error al procesar los datos de esta pestaña. No te preocupes, tus datos están seguros.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-6 py-3 bg-[#1A2B48] text-white rounded-xl hover:bg-[#142034] transition-colors"
            >
              Volver al Inicio
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 border border-red-300 text-red-700 rounded-xl hover:bg-red-100 transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-playfair font-bold text-gray-900 ring-offset-2">
              Bienvenido de nuevo, {partner?.business_name || partner?.name || 'Partner'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">Reservas Netas</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">12</p>
                <div className="mt-4 flex items-center gap-1 text-green-600 text-sm font-medium">
                  <span>↑ 15%</span>
                  <span className="text-gray-400 font-normal">vs mes pasado</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">Ingresos Estimados</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">$45,000</p>
                <p className="text-xs text-gray-400 mt-2">Basado en saldo a cobrar</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">Ocupación Actual</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">75%</p>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-ocean-500 w-[75%]"></div>
                </div>
              </div>
            </div>

            {/* Perfil Supabase Card */}
            <div className="bg-ocean-50 border border-ocean-100 rounded-2xl p-6">
              <h3 className="font-semibold text-ocean-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Estado del Perfil Supabase
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="text-ocean-700">ID de Partner:</span>
                    <span className="font-mono text-ocean-900">{partner?.id?.substring(0, 18)}...</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-ocean-700">Email:</span>
                    <span className="font-medium text-ocean-900">{partner?.email}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="text-ocean-700">RUT:</span>
                    <span className="font-medium text-ocean-900">{partner?.rut || 'Pendiente'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-ocean-700">MINTUR:</span>
                    <span className="font-medium text-ocean-900">{partner?.mintur_registration || 'Pendiente'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reservas':
        return (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Reservas</h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              Aún no tienes registros de reservas procesadas. Una vez que los turistas compren tus servicios, aparecerán aquí.
            </p>
          </div>
        );

      case 'vidriera':
        return partnerId ? (
          <CatalogManager partnerId={partnerId} />
        ) : (
          <div className="p-8 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3 text-amber-900">
            <AlertCircle className="w-6 h-6" />
            <p>Error: No se pudo identificar el Partner ID para cargar el catálogo.</p>
          </div>
        );

      case 'qr':
        return partnerId ? (
          <VoucherQRScanner partnerId={partnerId} />
        ) : (
          <div className="p-8 bg-red-50 rounded-xl border border-red-200 text-red-900">
            <p className="font-bold">Error de Validación</p>
            <p>Es necesario estar autenticado como partner para acceder al escáner.</p>
          </div>
        );

      case 'configuracion':
        console.log('[PartnerDashboard] Rendering Configuration Tab. Partner Data:', partner);
        return (
          <div className="space-y-8 animate-fade-in">
            <section>
              <PartnerLegalConfig partnerId={partnerId} initialData={partner} />
            </section>

            <section className="pt-8 border-t border-gray-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Calendario y Horarios</h3>
                <p className="text-gray-600 mt-1">Configura cuándo está abierto tu establecimiento para recibir turistas.</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <AvailabilityScheduler
                  partnerId={partnerId}
                  initialSettings={partner?.availability_settings}
                  onSave={handleSaveAvailability}
                />
              </div>
            </section>
          </div>
        );

      default:
        return (
          <div className="text-center py-20">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Selecciona una opción del menú lateral.</p>
          </div>
        );
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#1A2B48] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos del partner...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <BarChart3 className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar datos</h1>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#1A2B48] text-white rounded-xl hover:bg-[#142034]"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Partner not found
  if (!partner && partnerId !== DEBUG_PARTNER_ID) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Partner no encontrado</h1>
          <p className="text-gray-600 mb-4">
            No se encontraron datos para este partner. Contacta a soporte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Debug info */}
      {partnerId === DEBUG_PARTNER_ID && (
        <div className="bg-yellow-400 text-yellow-900 p-2 text-center text-xs">
          🔧 Debug Mode - Usando partner de prueba: {partner?.business_name || partner?.name || 'Mock Partner'}
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#1A2B48] min-h-screen p-4 sticky top-0 h-screen overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-white text-xl font-bold">Panel Partner</h2>
            <p className="text-white/70 text-sm mt-1 truncate">{partner?.email}</p>
            <p className="text-white/50 text-xs mt-1 truncate">
              {partner?.business_name || partner?.name || 'Partner de EscapaUY'}
            </p>
          </div>

          {/* Stats Overlay */}
          <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
            <div className="bg-white/5 rounded-lg p-3">
              <span className="text-xs text-white/60">Ingresos</span>
              <p className="text-lg font-bold text-white">$45,000</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <span className="text-xs text-white/60">Reservas</span>
              <p className="text-lg font-bold text-white">12</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <span className="text-xs text-white/60">Ocupación</span>
              <p className="text-lg font-bold text-white">75%</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {[
              { id: 'dashboard' as const, label: 'Resumen', icon: BarChart3 },
              { id: 'reservas' as const, label: 'Reservas', icon: FileText },
              { id: 'vidriera' as const, label: 'Mi Vidriera', icon: Store },
              { id: 'qr' as const, label: 'Validar QR', icon: QrCode },
              { id: 'configuracion' as const, label: 'Configuración', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full p-3 rounded text-left flex items-center gap-2 transition-all ${isActive
                    ? 'bg-yellow-500 text-black font-bold shadow-lg'
                    : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="w-full mt-12 p-3 text-white/70 hover:text-white hover:bg-red-500/20 rounded flex items-center gap-2 transition-colors border border-white/5"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 h-screen overflow-y-auto">
          <header className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">
              {activeTab === 'dashboard' && '📊 Resumen General'}
              {activeTab === 'reservas' && '📄 Gestión de Reservas'}
              {activeTab === 'vidriera' && '🏪 Mi Vidriera'}
              {activeTab === 'qr' && '📱 Validación QR de Seguridad'}
              {activeTab === 'configuracion' && '⚙️ Configuración del Establecimiento'}
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{partner?.name}</p>
                <p className="text-xs text-gray-500">{partner?.location || 'Uruguay'}</p>
              </div>
              <div className="w-10 h-10 bg-ocean-100 rounded-full flex items-center justify-center text-ocean-700 font-bold">
                {partner?.name?.charAt(0) || 'P'}
              </div>
            </div>
          </header>

          <div className="max-w-6xl mx-auto">
            {SafeRenderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
