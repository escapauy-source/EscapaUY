import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Calendar, CreditCard, Globe, 
  Wallet, Settings, Bell, Shield, ChevronRight, 
  Edit2, Check, X, Ticket
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';

export function ProfilePage() {
  const { user, isAuthenticated, bigFiveScores, logout, setShowAuthModal } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Requerido</h1>
          <p className="text-gray-600 mb-6">Inicia sesión para ver tu perfil</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-3 bg-ocean-600 text-white font-medium rounded-xl hover:bg-ocean-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  // Mock vouchers
  const vouchers = [
    { id: 'v1', code: 'ESC-ABC123', activity: 'Cata de Tannat Premium', date: '2025-02-15', status: 'active' },
    { id: 'v2', code: 'ESC-DEF456', activity: 'Tour Histórico del Barrio', date: '2025-01-20', status: 'used' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-ocean-600 to-ocean-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h1 className="font-playfair text-2xl font-bold mb-1">{user.fullName}</h1>
              <p className="text-ocean-100">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  user.role === 'tourist' ? "bg-ocean-500/30 text-white" : "bg-amber-500/30 text-amber-100"
                )}>
                  {user.role === 'tourist' ? 'Turista' : 'Partner'}
                </span>
                {bigFiveScores && (
                  <span className="px-3 py-1 bg-purple-500/30 rounded-full text-xs font-medium text-purple-100">
                    ADN Viajero Completo
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-16 md:top-20 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-ocean-600 text-ocean-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Personal Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-900">Información Personal</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors"
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </>
                  )}
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Nombre Completo</p>
                    <p className="font-medium text-gray-900">{user.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <p className="font-medium text-gray-900">{user.kycData?.phone || 'No registrado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Fecha de Nacimiento</p>
                    <p className="font-medium text-gray-900">{user.kycData?.dob || 'No registrado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Documento</p>
                    <p className="font-medium text-gray-900">{user.kycData?.docNumber || 'No registrado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">País de Residencia</p>
                    <p className="font-medium text-gray-900">{user.originCountry || 'No registrado'}</p>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end">
                  <button className="flex items-center gap-2 px-6 py-3 bg-ocean-600 text-white font-medium rounded-xl hover:bg-ocean-700 transition-colors">
                    <Check className="w-4 h-4" />
                    Guardar Cambios
                  </button>
                </div>
              )}
            </div>

            {/* ADN Viajero */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-900">ADN Viajero</h2>
                <Link
                  to="/adn-viajero"
                  className="text-sm text-ocean-600 hover:underline"
                >
                  Actualizar
                </Link>
              </div>

              {bigFiveScores ? (
                <div className="space-y-4">
                  {Object.entries(bigFiveScores).map(([trait, score]) => (
                    <div key={trait}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 capitalize">{trait}</span>
                        <span className="font-medium text-gray-900">{score}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-ocean-400 to-ocean-600 rounded-full"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Aún no has completado tu perfil de viajero</p>
                  <Link
                    to="/adn-viajero"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-ocean-600 text-white font-medium rounded-xl hover:bg-ocean-700 transition-colors"
                  >
                    Descubrir mi ADN
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-6">Mis Vouchers</h2>
              
              {vouchers.length > 0 ? (
                <div className="space-y-4">
                  {vouchers.map(voucher => (
                    <div 
                      key={voucher.id}
                      className={cn(
                        "p-4 rounded-xl border flex items-center justify-between",
                        voucher.status === 'active' 
                          ? "bg-nature-50 border-nature-200" 
                          : "bg-gray-50 border-gray-200"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          voucher.status === 'active' ? "bg-nature-100" : "bg-gray-200"
                        )}>
                          <Ticket className={cn(
                            "w-6 h-6",
                            voucher.status === 'active' ? "text-nature-600" : "text-gray-400"
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{voucher.activity}</p>
                          <p className="text-sm text-gray-500">
                            {voucher.code} • {voucher.date}
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        voucher.status === 'active' 
                          ? "bg-nature-200 text-nature-800" 
                          : "bg-gray-200 text-gray-600"
                      )}>
                        {voucher.status === 'active' ? 'Activo' : 'Usado'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No tienes vouchers activos</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">Notificaciones</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <hr className="border-gray-100" />
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">Privacidad y Seguridad</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <hr className="border-gray-100" />
              <Link 
                to="/legal/terminos"
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">Términos de Servicio</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
              <hr className="border-gray-100" />
              <Link 
                to="/legal/privacidad"
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">Política de Privacidad</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            </div>

            <button
              onClick={logout}
              className="w-full py-4 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors"
            >
              Cerrar Sesión
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
