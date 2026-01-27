import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Shield, AlertTriangle, CheckCircle2, Info, Calendar, Coffee, Sparkles } from 'lucide-react';
import { useItineraryStore } from '@/store/itineraryStore';
import { cn } from '@/utils/cn';
import { useApp } from '@/context/AppContext';
import { KYCModal } from '@/components/KYCModal';
import type { KYCData } from '@/components/KYCForm';
import { calculateTaxBenefits } from '@/utils/taxUtils';
import { generateBookingId } from '@/utils/voucherGenerator';
import { hotels, activities } from '@/data/mockData';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, setShowAuthModal } = useApp();

  // ==================== ZUSTAND STORE ====================
  const itinerary = useItineraryStore((state) => state.itinerary);
  const selectedHotel = useItineraryStore((state) => state.selectedHotel);
  const numberOfNights = useItineraryStore((state) => state.numberOfNights);
  const residencyCountry = useItineraryStore((state) => state.residencyCountry);
  const setResidencyCountry = useItineraryStore((state) => state.setResidencyCountry);
  const generateVouchers = useItineraryStore((state) => state.generateVouchers);

  // Financial Engine v3.0 - Store Hooks
  const currency = useItineraryStore((state) => state.currency);
  const exchangeRate = useItineraryStore((state) => state.exchangeRate);
  const setCurrency = useItineraryStore((state) => state.setCurrency);
  const setExchangeRate = useItineraryStore((state) => state.setExchangeRate);

  // Derive foreigner status directly from residencyCountry
  const isForeigner = residencyCountry !== null && residencyCountry !== 'Uruguay';

  const [acceptNoRetract, setAcceptNoRetract] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [kycCompleted, setKycCompleted] = useState(false);

  // Sync residency from user context if available
  useEffect(() => {
    if (isAuthenticated && user?.originCountry && !residencyCountry) {
      console.log('[ZUSTAND_DEBUG] Syncing residency from user profile:', user.originCountry);
      setResidencyCountry(user.originCountry);
    }

    console.log('[CHECKOUT_PERSISTENCE] Current Store State:', {
      hasItinerary: !!itinerary,
      daysCount: itinerary?.days?.length,
      hasHotel: !!selectedHotel,
      hotelId: selectedHotel?.id,
      adults: useItineraryStore.getState().numberOfAdults,
      kids: useItineraryStore.getState().numberOfChildren,
      bookingId: useItineraryStore.getState().bookingId,
      vouchersCount: useItineraryStore.getState().vouchers.length
    });
  }, [isAuthenticated, user, residencyCountry, setResidencyCountry]);

  // Validation: Check if required data exists
  if (!itinerary || !selectedHotel) {
    console.error('[ZUSTAND_DEBUG] Missing required data for checkout:', {
      hasItinerary: !!itinerary,
      hasHotel: !!selectedHotel
    });
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-2">
            Datos incompletos
          </h2>
          <p className="text-gray-600 mb-6">
            Por favor, completa tu itinerario antes de proceder al pago
          </p>
          <button
            onClick={() => navigate('/itinerary-builder')}
            className="px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
          >
            Ir al Constructor de Itinerario
          </button>
        </div>
      </div>
    );
  }

  // Get PAX from store
  const adults = useItineraryStore.getState().numberOfAdults;
  const kids = useItineraryStore.getState().numberOfChildren;

  // Prepare items for tax engine
  const taxItems: any[] = [];

  // Hotel Item - Re-fetch for fresh data
  if (selectedHotel) {
    const freshHotel = hotels.find(h => h.id === selectedHotel.id) || selectedHotel;
    const hAdult = freshHotel.price_adult ?? freshHotel.pricePerNight ?? 0;
    const hChild = freshHotel.price_child ?? 0;

    console.log('[CHECKOUT_DEBUG] Hotel Pricing:', {
      id: freshHotel.id,
      adults,
      kids,
      pAdult: hAdult,
      pChild: hChild,
      total: numberOfNights * ((adults * hAdult) + (kids * hChild))
    });

    taxItems.push({
      category: 'hotel',
      grossAmount: numberOfNights * ((adults * hAdult) + (kids * hChild))
    });
  }

  // Activity Items
  itinerary.days.forEach(day => {
    day.periods.forEach(period => {
      if (period.activityId) {
        const freshActivity = activities.find(a => a.id === period.activityId);
        if (freshActivity) {
          const pAdult = freshActivity.price_adult ?? freshActivity.price ?? 0;
          const pChild = freshActivity.price_child ?? freshActivity.price ?? 0;

          taxItems.push({
            category: freshActivity.category === 'restaurante' ? 'restaurante' : 'actividad',
            grossAmount: (adults * pAdult) + (kids * pChild),
            vatBenefitOverride: freshActivity.vat_benefit
          });
        }
      }
    });
  });

  // Tax calculations using the tax benefits engine
  const taxBreakdown = calculateTaxBenefits({
    items: taxItems,
    isNonUruguayanResident: isForeigner,
    paidElectronically: true
  });

  const {
    subtotal,
    hotelSubtotal: hotelTotal,
    activitiesSubtotal: activitiesTotal,
    accommodationIVADiscount,
    gastronomyIVADiscount,
    totalDiscount,
    finalTotal,
    depositWeb,
    balanceLocal
  } = taxBreakdown;

  // Helper for currency display
  const formatPrice = (amountUYU: number) => {
    if (currency === 'USD') {
      const amountUSD = amountUYU / exchangeRate;
      return `$${amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
    }
    return `$${Math.round(amountUYU).toLocaleString('es-UY')}`;
  };

  const hotelName = selectedHotel.name;

  console.log('[DEBUG_TAX_ENGINE]', {
    params: { hotelTotal, activitiesTotal, isForeigner },
    results: { accommodationIVADiscount, gastronomyIVADiscount, totalDiscount, finalTotal }
  });

  const handlePayment = async () => {
    if (!acceptNoRetract || !acceptTerms) {
      console.warn('[ZUSTAND_DEBUG] Cannot proceed: consents not accepted');
      return;
    }

    if (!isAuthenticated) {
      console.log('[ZUSTAND_DEBUG] User not authenticated, showing login modal before payment');
      setShowAuthModal(true);
      return;
    }

    // Check KYC completion first
    if (!kycCompleted || !residencyCountry) {
      console.log('[ZUSTAND_DEBUG] KYC not completed, showing modal');
      setShowKYCModal(true);
      return;
    }

    console.log('[ZUSTAND_DEBUG] Processing payment...');
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate unique booking ID
    const bookingId = generateBookingId();

    console.log('[ZUSTAND_DEBUG] Payment successful, generating vouchers for booking:', bookingId);

    // Generate vouchers
    const success = generateVouchers(
      bookingId,
      user?.fullName || 'Invitado',
      residencyCountry || 'Uruguay',
      numberOfNights
    );

    if (success) {
      // Navigate to success page
      console.log('[ZUSTAND_DEBUG] Navigating to checkout success');
      navigate('/checkout/success');
    } else {
      console.error('[ZUSTAND_DEBUG] Failed to generate vouchers');
      setIsProcessing(false);
    }
  };

  const handleKYCSubmit = (data: KYCData) => {
    console.log('[ZUSTAND_DEBUG] KYC submitted:', {
      country: data.countryOfResidence,
      documentType: data.documentType
    });

    // Save residency country to store
    setResidencyCountry(data.countryOfResidence);

    // Mark KYC as completed
    setKycCompleted(true);
    setShowKYCModal(false);

    console.log('[ZUSTAND_DEBUG] KYC completed, residency country saved:', data.countryOfResidence);

    // After KYC completion, proceed with payment
    handlePayment();
  };

  // Count activities by type
  const activityCount = itinerary.days.reduce((sum: number, day: any) => {
    return sum + day.periods.filter((p: any) => p.activityId !== null).length;
  }, 0);

  const restCount = itinerary.days.reduce((sum: number, day: any) => {
    return sum + day.periods.filter((p: any) => p.isResting).length;
  }, 0);

  console.log('[DEBUG_CHECKOUT] State:', {
    residencyCountry,
    isForeigner,
    isAuthenticated,
    kycCompleted
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-ocean-50/10">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver al Itinerario</span>
          </button>

          <h1 className="font-playfair text-4xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
            Confirmar y Pagar
          </h1>
          <p className="text-gray-600">
            Revisa tu itinerario y completa el pago seguro
          </p>
        </div>
      </div>

      {/* Financial Controls v3.0 (Admin/User) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-wrap gap-4 items-center bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Moneda</span>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setCurrency('UYU')}
                className={cn(
                  'px-3 py-1 text-sm',
                  currency === 'UYU' ? 'bg-ocean-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                UYU
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={cn(
                  'px-3 py-1 text-sm',
                  currency === 'USD' ? 'bg-ocean-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                USD
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs font-mono text-gray-500">ADMIN RATE</span>
            <input
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded text-right"
            />
            <span className="text-xs text-gray-400">UYU/USD</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Trip Summary */}
          <div className="space-y-6">
            {/* Hotel */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-start gap-4">
                <img
                  src={selectedHotel.images[0]}
                  alt={selectedHotel.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{hotelName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{selectedHotel.city}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-ocean-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {numberOfNights} {numberOfNights === 1 ? 'noche' : 'noches'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Hospedaje</p>
                      <p className="text-lg font-bold text-ocean-700">{formatPrice(hotelTotal)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Itinerary Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="font-semibold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <Coffee className="w-6 h-6 text-ocean-600" />
                Resumen de Actividades
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-ocean-50 rounded-xl">
                  <p className="text-sm text-ocean-700 mb-1">Experiencias</p>
                  <p className="text-3xl font-bold text-ocean-900">{activityCount}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl">
                  <p className="text-sm text-amber-700 mb-1">Pausas</p>
                  <p className="text-3xl font-bold text-amber-900">{restCount}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Actividades</span>
                  <span className="font-semibold text-gray-900">{formatPrice(activitiesTotal)}</span>
                </div>
              </div>
            </div>

            {/* Legal Consents */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="font-semibold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-ocean-600" />
                Protección Legal
              </h2>

              {/* No Retract Warning */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900 mb-2">
                      ⚖️ Art. 16 - Ley 17.250 (Defensa del Consumidor)
                    </p>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      Los servicios turísticos con <strong>fecha determinada</strong> están exceptuados
                      del derecho de retracto. Esta reserva NO admite cancelación con devolución
                      transcurridas las primeras 24 horas. Al confirmar, usted renuncia expresamente
                      al derecho de arrepentimiento de 5 días hábiles establecido en la normativa uruguaya.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Checkbox 1: No Retract */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptNoRetract}
                    onChange={(e) => setAcceptNoRetract(e.target.checked)}
                    className="mt-1 w-6 h-6 rounded border-2 border-gray-300 text-ocean-600 focus:ring-2 focus:ring-ocean-500 focus:ring-offset-2 transition-all"
                  />
                  <span className="text-sm text-gray-800 group-hover:text-gray-900 transition-colors">
                    <strong className="text-gray-900">Acepto expresamente</strong> que al tratarse de servicios
                    con fecha determinada (hotel + actividades), <strong>renuncio al derecho de retracto</strong> establecido
                    en el Art. 16 de la Ley 17.250 de Defensa del Consumidor de Uruguay. Comprendo que esta reserva
                    es vinculante y no reembolsable salvo por causa de fuerza mayor climática.
                    <span className="text-red-600">*</span>
                  </span>
                </label>

                {/* Checkbox 2: Terms */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 w-6 h-6 rounded border-2 border-gray-300 text-ocean-600 focus:ring-2 focus:ring-ocean-500 focus:ring-offset-2 transition-all"
                  />
                  <span className="text-sm text-gray-800 group-hover:text-gray-900 transition-colors">
                    Acepto los <Link to="/terms" className="text-ocean-600 hover:underline font-semibold">Términos y Condiciones</Link> y
                    la <Link to="/privacy" className="text-ocean-600 hover:underline font-semibold">Política de Privacidad</Link> de EscapaUY.
                    <span className="text-red-600">*</span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Payment */}
          <div className="space-y-6">
            {/* Financial Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-ocean-50 to-ocean-100/50 border-b border-ocean-200">
                <h2 className="font-playfair text-2xl font-bold" style={{ color: '#1a1a1a' }}>
                  Desglose Financiero
                </h2>
                <p className="text-sm text-gray-600 mt-1">Transparencia quirúrgica</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Auth Notification */}
                {!isAuthenticated && (
                  <div className="p-4 bg-ocean-50 border border-ocean-200 rounded-xl mb-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-ocean-600 mt-0.5" />
                      <div>
                        <p className="font-bold text-ocean-900 text-sm">Casi listo...</p>
                        <p className="text-xs text-ocean-700 leading-relaxed">
                          Inicia sesión para vincular este itinerario a tu cuenta y recibir tus vouchers legales.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Base Prices */}
                <div className="space-y-3 text-sm pb-4 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hospedaje ({numberOfNights}n)</span>
                    <span className="font-medium text-gray-900">{formatPrice(hotelTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actividades ({activityCount})</span>
                    <span className="font-medium text-gray-900">{formatPrice(activitiesTotal)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-100">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                </div>

                {/* Tax Benefits Breakdown */}
                {isForeigner && (accommodationIVADiscount > 0 || gastronomyIVADiscount > 0) ? (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200 space-y-2">
                    <div className="flex items-start gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-800 text-sm">
                          🎁 Beneficios Fiscales Uruguay
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Descuentos automáticos de IVA según Ley 19.253
                        </p>
                        {isForeigner && (
                          <p className="text-xs text-green-600 mt-1">
                            ✅ Residencia: <strong>{residencyCountry}</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    {isForeigner && accommodationIVADiscount > 0 && (
                      <div className="flex justify-between items-center text-green-700 text-sm">
                        <span>IVA Alojamiento (22%)</span>
                        <span className="font-bold">-{formatPrice(accommodationIVADiscount)}</span>
                      </div>
                    )}

                    {gastronomyIVADiscount > 0 && (
                      <div className="flex justify-between items-center text-green-700 text-sm">
                        <span>IVA Gastronomía (9 pts)</span>
                        <span className="font-bold">-{formatPrice(gastronomyIVADiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-green-800 font-bold pt-2 border-t border-green-300">
                      <span>Total Ahorro</span>
                      <span className="text-lg">-{formatPrice(totalDiscount)}</span>
                    </div>
                  </div>
                ) : null}

                {/* Final Total */}
                <div className="pt-4 border-t-2" style={{ borderColor: '#C5A059' }}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold" style={{ color: '#1a1a1a' }}>
                      Total Final
                    </span>
                    <span className="text-3xl font-bold" style={{ color: '#C5A059' }}>
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Precio final con impuestos incluidos {currency === 'USD' ? `(Tasa aplicada: ${exchangeRate})` : '(Pesos Uruguayos)'}
                  </p>
                </div>

                {/* Payment Split */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="p-4 bg-ocean-50 rounded-xl border border-ocean-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-ocean-900">Seña Web (15%)</span>
                      <span className="text-lg font-bold text-ocean-700">{formatPrice(depositWeb)}</span>
                    </div>
                    <p className="text-xs text-ocean-600">Pago seguro ahora {currency === 'USD' && 'en USD'}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-700">Saldo en Local (85%)</span>
                      <span className="text-lg font-bold text-gray-900">{formatPrice(balanceLocal)}</span>
                    </div>
                    <p className="text-xs text-gray-500">Al Partner en destino</p>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={!acceptNoRetract || !acceptTerms || isProcessing}
                  className={cn(
                    'w-full mt-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform',
                    acceptNoRetract && acceptTerms && !isProcessing
                      ? 'bg-gradient-to-r from-ocean-600 to-ocean-700 text-white hover:shadow-2xl hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  )}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Procesando pago seguro...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6" />
                      {isAuthenticated ? `Pagar ${formatPrice(depositWeb)}` : 'Ingresar para Pagar'}
                    </>
                  )}
                </button>

                {(!acceptNoRetract || !acceptTerms) ? (
                  <p className="text-xs text-center text-red-600 mt-2">
                    ⚠️ Debes aceptar ambos consentimientos legales
                  </p>
                ) : null}

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Fondos segregados · Normativa BCU</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-ocean-600" />
                    <span>Plan B automático por clima adverso</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-gray-500" />
                    <span>Certificado SSL 256-bit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Modal */}
      <KYCModal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        onSubmit={handleKYCSubmit}
      />

      {/* DEBUG */}
      <div className="fixed bottom-4 right-4 p-3 bg-gray-900 text-white text-xs rounded-lg max-w-xs">
        <p>Residency: {residencyCountry || 'Not set'}</p>
        <p>Currency: {currency}</p>
        <p>Rate: {exchangeRate}</p>
        <p>KYC: {kycCompleted ? 'Complete' : 'Pending'}</p>
        <p>IVA Discount: ${Math.round(totalDiscount).toLocaleString()}</p>
      </div>
    </div>
  );
}
