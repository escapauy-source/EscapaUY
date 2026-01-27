import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, BarChart3, Calendar, Users, ArrowRight } from 'lucide-react';

export function PartnerLandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block px-4 py-2 bg-ocean-600/20 border border-ocean-500/30 rounded-full mb-6">
                        <span className="text-ocean-400 text-sm font-semibold">Portal de Partners</span>
                    </div>
                    <h1 className="font-playfair text-5xl sm:text-6xl font-bold mb-6">
                        Bienvenido, Partner
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Gestiona tus servicios, escanea vouchers y accede a tu panel de control
                    </p>
                </motion.div>

                {/* Quick Access Cards */}
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* Scanner Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link
                            to="/partner/scanner"
                            className="block group"
                        >
                            <div className="bg-gradient-to-br from-ocean-600 to-ocean-700 rounded-2xl p-8 shadow-2xl hover:shadow-ocean-500/20 transition-all hover:scale-[1.02]">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                                    <QrCode className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="font-playfair text-3xl font-bold mb-3">
                                    Escanear Vouchers
                                </h2>
                                <p className="text-ocean-100 mb-6">
                                    Valida los códigos QR de tus clientes y confirma servicios entregados
                                </p>
                                <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-4 transition-all">
                                    Ir al Scanner
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Dashboard Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Link
                            to="/partner/dashboard"
                            className="block group"
                        >
                            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-600 hover:border-ocean-500/50 transition-all hover:scale-[1.02]">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                                    <BarChart3 className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="font-playfair text-3xl font-bold mb-3">
                                    Panel de Control
                                </h2>
                                <p className="text-gray-300 mb-6">
                                    Accede a estadísticas, reservas y gestiona la disponibilidad de tu negocio
                                </p>
                                <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-4 transition-all">
                                    Ir al Dashboard
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>

                {/* Info Cards */}
                <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                    >
                        <Users className="w-8 h-8 text-ocean-400 mb-4" />
                        <h3 className="font-semibold text-lg mb-2">Reservas en Tiempo Real</h3>
                        <p className="text-sm text-gray-400">
                            Ve tus próximas reservas y gestiona la capacidad de tu establecimiento
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                    >
                        <Calendar className="w-8 h-8 text-ocean-400 mb-4" />
                        <h3 className="font-semibold text-lg mb-2">Derivación Climática</h3>
                        <p className="text-sm text-gray-400">
                            Recibe clientes automáticamente cuando el clima favorece a tu tipo de actividad
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                    >
                        <div className="text-3xl mb-4">💰</div>
                        <h3 className="font-semibold text-lg mb-2">Revenue Tracking</h3>
                        <p className="text-sm text-gray-400">
                            Visualiza tus earnings y saldo pendiente de liquidación
                        </p>
                    </motion.div>
                </div>

                {/* Back to Tourist Mode */}
                <div className="text-center mt-16">
                    <Link
                        to="/"
                        className="inline-block text-gray-400 hover:text-white transition-colors"
                    >
                        ← Volver al modo turista
                    </Link>
                </div>
            </div>
        </div>
    );
}
