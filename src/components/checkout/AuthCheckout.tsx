import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, User } from '../../stores/authStore';
import { PaymentSummary } from '../../types';

// Nacionalidades comunes para Colonia (turistas)
const NATIONALITIES = [
  { code: 'AR', name: 'Argentina' },
  { code: 'BR', name: 'Brasil' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'ES', name: 'España' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'CL', name: 'Chile' },
  { code: 'MX', name: 'México' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Perú' },
  { code: 'EU', name: 'Otro - Unión Europea' },
  { code: 'OTHER', name: 'Otro' }
];

// Países para el selector
const COUNTRIES = [
  { code: 'AR', name: 'Argentina' },
  { code: 'BR', name: 'Brasil' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'ES', name: 'España' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'CL', name: 'Chile' },
  { code: 'MX', name: 'México' },
  { code: 'CA', name: 'Canadá' },
  { code: 'UK', name: 'Reino Unido' },
  { code: 'DE', name: 'Alemania' },
  { code: 'FR', name: 'Francia' },
  { code: 'IT', name: 'Italia' },
  { code: 'OTHER', name: 'Otro' }
];

interface AuthCheckoutProps {
  paymentSummary: PaymentSummary;
  onComplete: (userData: User) => void;
  onBack: () => void;
}

export const AuthCheckout: React.FC<AuthCheckoutProps> = ({
  paymentSummary,
  onComplete,
  onBack
}) => {
  const { t } = useTranslation();
  const { user, isAuthenticated, login, register, updateProfile, setGuestData, isLoading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register' | 'guest' | 'data'>('login');
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    name: user?.name || '',
    documentType: user?.documentType || 'passport',
    documentNumber: user?.documentNumber || '',
    birthDate: user?.birthDate || '',
    nationality: user?.nationality || '',
    country: user?.country || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fix: Update formData when user changes (e.g. after login/register or store hydration)
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        name: user.name || prev.name,
        documentType: user.documentType || prev.documentType,
        documentNumber: user.documentNumber || prev.documentNumber,
        birthDate: user.birthDate || prev.birthDate,
        nationality: user.nationality || prev.nationality,
        country: user.country || prev.country,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        city: user.city || prev.city
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    clearError();
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = t('auth.validation.email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('auth.validation.email_invalid');
    }

    if (mode !== 'guest' && !formData.password) {
      errors.password = 'La contraseña es obligatoria';
    }

    if (mode === 'register' && !formData.name) {
      errors.name = 'El nombre es obligatorio';
    }

    if (formData.documentType === 'dni' && formData.documentNumber && !/^\d{6,9}$/.test(formData.documentNumber)) {
      errors.documentNumber = 'DNI inválido (6-9 dígitos)';
    }

    if (formData.birthDate && new Date(formData.birthDate) > new Date()) {
      errors.birthDate = 'La fecha no puede ser futura';
    }

    if (formData.phone && !/^\+?[\d\s-]{8,}$/.test(formData.phone)) {
      errors.phone = t('auth.validation.phone_invalid');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await login(formData.email, formData.password);
      if (user) {
        setMode('data');
      }
    } catch (error) {
      // Error shown in UI
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await register(formData.email, formData.password, formData.name);
      if (user) {
        setMode('data');
      }
    } catch (error) {
      // Error shown in UI
    }
  };

  const handleGuest = () => {
    setGuestData({ email: formData.email, name: formData.name || 'Invitado' });
    setMode('data');
  };

  const handleDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const updatedUser: User = {
      ...user!,
      email: formData.email,
      name: formData.name || user?.name || 'Invitado',
      documentType: formData.documentType,
      documentNumber: formData.documentNumber,
      birthDate: formData.birthDate,
      nationality: formData.nationality,
      country: formData.country,
      phone: formData.phone,
      address: formData.address,
      city: formData.city
    };

    await updateProfile(updatedUser);
    onComplete(updatedUser);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('auth.title')}</h2>
        <p className="text-gray-600">{t('auth.subtitle')}</p>
        <p className="text-sm text-blue-600 mt-2">{t('auth.required_note')}</p>
      </div>

      {/* Mode Selector */}
      <div className="flex justify-center gap-4 mb-8">
        {['login', 'register', 'guest'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m as 'login' | 'register' | 'guest')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${mode === m
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {m === 'login' ? t('auth.login_btn') : m === 'register' ? t('auth.register_btn') : t('auth.guest_btn')}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <AnimatePresence mode="popLayout">
            {mode === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold mb-4">{t('auth.login_title')}</h3>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('auth.email_placeholder')}
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.password_label')}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('auth.password_placeholder')}
                  />
                  {validationErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? t('auth.logging_in') : t('header.login')}
                </button>

                <p className="text-center text-sm text-gray-600">
                  {t('auth.no_account')}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-blue-600 hover:underline"
                  >
                    {t('auth.go_register')}
                  </button>
                </p>
              </motion.form>
            )}

            {mode === 'register' && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold mb-4">{t('auth.register_title')}</h3>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('auth.email_placeholder')}
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.name_label')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('auth.name_placeholder')}
                  />
                  {validationErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.password_label')}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('auth.password_hint')}
                  />
                  {validationErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? t('auth.register_submit_loading') : t('auth.register_submit')}
                </button>

                <p className="text-center text-sm text-gray-600">
                  {t('auth.has_account')}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-blue-600 hover:underline"
                  >
                    {t('auth.go_login')}
                  </button>
                </p>
              </motion.form>
            )}

            {mode === 'guest' && (
              <motion.div
                key="guest"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold mb-4">{t('auth.guest_title')}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {t('auth.guest_subtitle')}
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('auth.email_placeholder')}
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleGuest}
                  className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  {t('auth.guest_submit')}
                </button>
              </motion.div>
            )}

            {(mode === 'data' || isAuthenticated) && (
              <motion.form
                key="data"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleDataSubmit}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold mb-4">{t('auth.title')}</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.document_type')}
                    </label>
                    <select
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="passport">{t('auth.document_types.passport')}</option>
                      <option value="dni">{t('auth.document_types.dni')}</option>
                      <option value="cedula">{t('auth.document_types.cedula')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.document_number')}
                    </label>
                    <input
                      type="text"
                      name="documentNumber"
                      value={formData.documentNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('auth.document_placeholder')}
                    />
                    {validationErrors.documentNumber && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.documentNumber}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.birth_date')}
                    </label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {validationErrors.birthDate && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.birthDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.nationality')}
                    </label>
                    <select
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">{t('auth.nationality_placeholder')}</option>
                      {NATIONALITIES.map(n => (
                        <option key={n.code} value={n.name}>{n.name}</option>
                      ))}
                    </select>
                    {validationErrors.nationality && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.nationality}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('auth.phone_placeholder')}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('auth.phone_hint')}</p>
                  {validationErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.passport')}
                  </label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={formData.documentType === 'passport' ? formData.documentNumber : ''}
                    onChange={(e) => {
                      if (formData.documentType === 'passport') {
                        setFormData(prev => ({ ...prev, documentNumber: e.target.value }));
                      }
                    }}
                    disabled={formData.documentType !== 'passport'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder={t('auth.passport_placeholder')}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('auth.passport_hint')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.country')}
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t('auth.country_placeholder')}</option>
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    {t('adn.back')}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? t('auth.saving') : t('auth.save_continue')}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Payment Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 h-fit">
          <h3 className="text-xl font-semibold mb-6">{t('checkout.trip_details')}</h3>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('checkout.dates')}</span>
              <span className="font-medium">{t('checkout.nights', { count: paymentSummary.nights })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('checkout.travelers')}</span>
              <span className="font-medium">
                {t('checkout.adults', { count: paymentSummary.adults })}{paymentSummary.children > 0 ? `, ${t('checkout.children', { count: paymentSummary.children })}` : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('checkout.subtotal')}</span>
              <span className="font-medium">${paymentSummary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>{t('checkout.iva_benefit')}</span>
              <span>-${paymentSummary.ivaSavings.toFixed(2)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${paymentSummary.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 mb-4">
            <p className="text-sm font-medium text-gray-800 mb-2">{t('checkout.deposit_note')}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-blue-600">
                <span>{t('checkout.pay_now')}</span>
                <span className="font-bold">${paymentSummary.depositAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('checkout.pay_destination')}</span>
                <span>${paymentSummary.remainingAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            {t('payment.secure_notice')} • {t('payment.bcu_regulated')}
          </div>
        </div>
      </div>
    </div>
  );
};
