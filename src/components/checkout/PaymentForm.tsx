import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PaymentSummary } from '../../types';
import { User } from '../../stores/authStore';

interface PaymentFormProps {
  paymentSummary: PaymentSummary;
  user: User;
  onSuccess: (transactionId: string) => void;
  onBack: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentSummary,
  user,
  onSuccess,
  onBack
}) => {
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [installments, setInstallments] = useState(1);
  const [cardData, setCardData] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvv: ''
  });
  const [billingAddress, setBillingAddress] = useState({
    same: true,
    address: '',
    city: '',
    country: ''
  });
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'number') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    }
    // Format expiry as MM/YY
    if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/^(\d{2})/g, '$1/').slice(0, 5);
    }
    // Limit CVV to 4 digits
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardData(prev => ({ ...prev, [name]: formattedValue }));
    setError(null);
  };

  const validateCard = (): boolean => {
    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 16) {
      setError('Número de tarjeta inválido');
      return false;
    }
    if (!cardData.holder) {
      setError('Ingresa el titular de la tarjeta');
      return false;
    }
    if (!cardData.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      setError('Vencimiento inválido (MM/YY)');
      return false;
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      setError('CVV inválido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedTerms) {
      setError('Debes aceptar los términos para continuar');
      return;
    }

    if (paymentMethod === 'card' && !validateCard()) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful transaction
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      onSuccess(transactionId);
    } catch (err) {
      setError('Error al procesar el pago. Por favor intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('payment.title')}</h2>
        <div className="flex justify-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            {t('payment.ssl_protected')}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {t('payment.bcu_regulated')}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Due */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white mb-6">
              <p className="text-sm opacity-90">{t('payment.amount_due')}</p>
              <p className="text-4xl font-bold">${paymentSummary.depositAmount.toFixed(2)}</p>
              <p className="text-sm mt-2 opacity-80">
                {t('payment.remaining')}: ${paymentSummary.remainingAmount.toFixed(2)}
              </p>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('checkout.payment_methods')}
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  {t('checkout.credit_card')}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 3.72a.64.64 0 01.632-.54h4.607c1.41 0 2.647.905 3.104 2.218l.594 1.705c.063.181.24.295.427.295h2.373c1.024 0 1.854.83 1.854 1.854v1.04c0 1.024-.83 1.854-1.854 1.854h-1.04c-1.024 0-1.854.83-1.854 1.854v1.04c0 1.024.83 1.854 1.854 1.854h1.04c1.024 0 1.854.83 1.854 1.854v.666c0 .398-.153.777-.424 1.05a1.458 1.458 0 01-1.05.424h-8.38a1.458 1.458 0 01-1.05-.424 1.458 1.458 0 01-.424-1.05v-.666c0-.398.153-.777.424-1.05a1.458 1.458 0 011.05-.424h.666c1.024 0 1.854-.83 1.854-1.854v-1.04c0-1.024-.83-1.854-1.854-1.854h-1.04c-1.024 0-1.854-.83-1.854-1.854V9.696c0-1.024.83-1.854 1.854-1.854h1.04c1.024 0 1.854.83 1.854 1.854v1.04c0 .398-.153.777-.424 1.05a1.458 1.458 0 01-1.05.424H8.44a.5.5 0 00-.5.5v2.628c0 .276.224.5.5.5h2.373c.398 0 .777.153 1.05.424.273.271.424.652.424 1.05v.666c0 .398-.153.777-.424 1.05a1.458 1.458 0 01-1.05.424H7.076z"/>
                  </svg>
                  PayPal
                </button>
              </div>
            </div>

            {/* Card Details */}
            {paymentMethod === 'card' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('payment.card_details')}
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={cardData.number}
                    onChange={handleCardInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.card_holder')}
                  </label>
                  <input
                    type="text"
                    name="holder"
                    value={cardData.holder}
                    onChange={handleCardInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="NOMBRE APELLIDO"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.card_expiry')}
                    </label>
                    <input
                      type="text"
                      name="expiry"
                      value={cardData.expiry}
                      onChange={handleCardInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.card_cvv')}
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={cardData.cvv}
                      onChange={handleCardInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('checkout.installments')}
                  </label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">{t('checkout.one_payment')}</option>
                    <option value="2">2 cuotas de ${(paymentSummary.depositAmount / 2).toFixed(2)}</option>
                    <option value="3">3 cuotas de ${(paymentSummary.depositAmount / 3).toFixed(2)}</option>
                    <option value="6">6 cuotas de ${(paymentSummary.depositAmount / 6).toFixed(2)}</option>
                    <option value="12">12 cuotas de ${(paymentSummary.depositAmount / 12).toFixed(2)}</option>
                  </select>
                </div>
              </motion.div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-gray-600 mb-4">Serás redirigido a PayPal para completar el pago de forma segura.</p>
                <button
                  type="button"
                  className="w-full bg-[#0070ba] text-white py-3 rounded-lg font-semibold hover:bg-[#003087] transition-colors"
                >
                  Continuar con PayPal
                </button>
              </div>
            )}

            {/* Billing Address */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="sameAddress"
                  checked={billingAddress.same}
                  onChange={(e) => setBillingAddress(prev => ({ ...prev, same: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="sameAddress" className="text-sm text-gray-700">
                  {t('payment.same_address')}
                </label>
              </div>

              {!billingAddress.same && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.address')}
                    </label>
                    <input
                      type="text"
                      value={billingAddress.address}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('auth.address_placeholder')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auth.city')}
                      </label>
                      <input
                        type="text"
                        value={billingAddress.city}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auth.country')}
                      </label>
                      <select
                        value={billingAddress.country}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar</option>
                        <option value="UY">Uruguay</option>
                        <option value="AR">Argentina</option>
                        <option value="BR">Brasil</option>
                        <option value="US">Estados Unidos</option>
                        <option value="ES">España</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 mt-1 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                {t('checkout.terms_agree')}{' '}
                <a href="#" className="text-blue-600 hover:underline">Términos de Servicio</a>
                {' '}y{' '}
                <a href="#" className="text-blue-600 hover:underline">Política de Privacidad</a>
              </label>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {t('adn.back')}
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {t('payment.processing_your_payment')}
                  </>
                ) : (
                  t('payment.confirm_payment')
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 h-fit">
          <h3 className="text-xl font-semibold mb-6">Resumen del Pedido</h3>

          {/* Traveler Info */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <p className="text-sm font-medium text-gray-500 mb-2">{t('checkout.traveler_info')}</p>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            {user.phone && <p className="text-sm text-gray-600">{user.phone}</p>}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>{t('checkout.subtotal')}</span>
              <span>${paymentSummary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>{t('checkout.iva_benefit')}</span>
              <span>-${paymentSummary.ivaSavings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>{t('voucher.iva_exempt')}</span>
              <span>-${paymentSummary.hotelTaxSavings.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>{t('voucher.total_paid')}</span>
                <span>${paymentSummary.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Schedule */}
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm font-medium text-gray-800 mb-3">Calendario de Pagos</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Pago Online (15%)</p>
                  <p className="text-xs text-gray-500">Ahora con tarjeta</p>
                </div>
                <span className="font-bold text-blue-600">${paymentSummary.depositAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Pago en Destino (85%)</p>
                  <p className="text-xs text-gray-500">Al llegar al hotel</p>
                </div>
                <span className="font-bold text-gray-600">${paymentSummary.remainingAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Security Badges */}
          <div className="mt-6 text-center">
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {t('payment.secure_notice')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
