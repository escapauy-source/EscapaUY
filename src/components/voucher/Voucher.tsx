import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User } from '../../stores/authStore';
import { PaymentSummary, ItineraryDay, Activity } from '../../types';
import { generateBookingReference } from '../../utils/bookingUtils';

interface VoucherProps {
  user: User;
  paymentSummary: PaymentSummary;
  itineraryDays: ItineraryDay[];
  hotel: {
    name: string;
    address: string;
    phone: string;
    email: string;
    coordinates?: { lat: number; lng: number };
  };
  onDownload: () => void;
  onShare: () => void;
  onAddToCalendar: () => void;
}

export const Voucher: React.FC<VoucherProps> = ({
  user,
  paymentSummary,
  itineraryDays,
  hotel,
  onDownload,
  onShare,
  onAddToCalendar
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  const bookingReference = generateBookingReference();
  const today = new Date().toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generate QR Code data (in production, use a QR library)
  const qrData = JSON.stringify({
    ref: bookingReference,
    hotel: hotel.name,
    checkIn: paymentSummary.checkInDate,
    checkOut: paymentSummary.checkOutDate,
    guests: paymentSummary.adults + paymentSummary.children
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Actions */}
      <div className="flex justify-end gap-3 mb-6">
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {t('voucher.download_pdf')}
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {t('voucher.share')}
        </button>
        <button
          onClick={onAddToCalendar}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {t('voucher.add_calendar')}
        </button>
      </div>

      {/* Voucher Document */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('voucher.title')}</h1>
              <p className="text-blue-100">{t('voucher.subtitle')}</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm text-blue-100">{t('voucher.booking_reference')}</p>
                <p className="text-2xl font-mono font-bold">{bookingReference}</p>
              </div>
              <p className="text-sm mt-2 text-blue-100">
                {t('voucher.generated_date')}: {today}
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="bg-green-500 text-white px-8 py-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <span className="font-semibold">{t('voucher.status_confirmed')}</span>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Traveler & Trip Info */}
            <div className="space-y-6">
              {/* Traveler Details */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('voucher.traveler_details')}
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">{t('auth.document_type')}:</span>
                      <p className="font-medium">{user.documentType === 'passport' ? 'Pasaporte' : user.documentType?.toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('voucher.document')}:</span>
                      <p className="font-medium">{user.documentNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('voucher.nationality')}:</span>
                      <p className="font-medium">{user.nationality}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('voucher.phone')}:</span>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">{t('voucher.email')}:</span>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
              </section>

              {/* Trip Summary */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  {t('voucher.trip_summary')}
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">{hotel.name}</p>
                      <p className="text-sm text-gray-600">{hotel.address}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500">{t('voucher.check_in')}</p>
                      <p className="font-semibold">{new Date(paymentSummary.checkInDate).toLocaleDateString('es-UY')}</p>
                      <p className="text-sm text-gray-600">Desde las 15:00</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500">{t('voucher.check_out')}</p>
                      <p className="font-semibold">{new Date(paymentSummary.checkOutDate).toLocaleDateString('es-UY')}</p>
                      <p className="text-sm text-gray-600">Hasta las 11:00</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500">{t('voucher.guests')}</p>
                    <p className="font-semibold">
                      {paymentSummary.adults} adultos
                      {paymentSummary.children > 0 && `, ${paymentSummary.children} niños`}
                    </p>
                  </div>
                </div>
              </section>

              {/* Activities */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('voucher.activities')}
                </h3>
                <div className="space-y-3">
                  {itineraryDays.map((day, index) => (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-blue-600">
                          {t('voucher.day')} {index + 1}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(day.date).toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      {day.activities.length > 0 ? (
                        <div className="space-y-2">
                          {day.activities.map((activity, actIndex) => (
                            <div
                              key={activity.id}
                              className={`flex items-start gap-3 p-2 rounded-lg ${
                                activity.isPlanB ? 'bg-amber-50 border border-amber-200' : 'bg-white'
}`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                activity.isPlanB ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                                {actIndex + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{activity.name}</p>
                                <p className="text-xs text-gray-500">
                                  {activity.time} • {activity.category}
                                </p>
                                {activity.isPlanB && (
                                  <span className="inline-flex items-center gap-1 text-xs text-amber-600 mt-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                    </svg>
                                    {t('itinerary.card.weather_plan_b')}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">{t('voucher.no_activities')}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column - Price, Benefits, Contact, QR */}
            <div className="space-y-6">
              {/* Price Summary */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('voucher.price_summary')}
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('checkout.subtotal')}</span>
                    <span>${paymentSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>{t('voucher.iva_exempt')}</span>
                    <span>-${paymentSummary.hotelTaxSavings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>{t('voucher.iva_refund')}</span>
                    <span>-${paymentSummary.restaurantSavings.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>{t('voucher.total_paid')}</span>
                      <span>${paymentSummary.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 mt-3">
                    <div className="flex justify-between text-blue-700">
                      <span className="text-sm">{t('voucher.paid_now')}</span>
                      <span className="font-semibold">${paymentSummary.depositAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 mt-1">
                      <span className="text-sm">{t('voucher.pay_destination')}</span>
                      <span className="font-semibold">${paymentSummary.remainingAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Benefits */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  {t('voucher.benefits')}
                </h3>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-green-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="font-medium">{t('voucher.iva_exempt')} (22%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="font-medium">{t('voucher.iva_refund')} (9%)</span>
                  </div>
                </div>
              </section>

              {/* Contact Info */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {t('voucher.contact_info')}
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">{t('voucher.emergency')}</p>
                    <p className="font-semibold text-blue-600">+598 99 123 456</p>
                    <p className="text-xs text-gray-500">24 horas / 7 días</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('voucher.provider_contact')}</p>
                    <p className="font-medium">{hotel.name}</p>
                    <p className="text-sm text-gray-600">{hotel.phone}</p>
                    <p className="text-sm text-gray-600">{hotel.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('voucher.location')}</p>
                    <p className="font-medium">{hotel.name}</p>
                    <p className="text-sm text-gray-600">{hotel.address}</p>
                  </div>
                </div>
              </section>

              {/* QR Code */}
              <section className="bg-white rounded-xl p-6 border-2 border-dashed border-gray-300 text-center">
                <p className="text-sm font-medium text-gray-700 mb-4">{t('voucher.qr_code')}</p>
                <div className="bg-white p-4 rounded-xl inline-block shadow-md mb-2">
                  {/* QR Code placeholder - in production use qrcode library */}
                  <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-32 h-32 text-gray-400" fill="currentColor" viewBox="0 0 100 100">
                      <rect x="10" y="10" width="20" height="20" />
                      <rect x="40" y="10" width="10" height="10" />
                      <rect x="60" y="10" width="10" height="10" />
                      <rect x="70" y="10" width="20" height="20" />
                      <rect x="10" y="40" width="10" height="10" />
                      <rect x="30" y="40" width="10" height="10" />
                      <rect x="50" y="40" width="10" height="10" />
                      <rect x="70" y="40" width="20" height="10" />
                      <rect x="10" y="60" width="10" height="20" />
                      <rect x="40" y="60" width="10" height="10" />
                      <rect x="60" y="60" width="10" height="10" />
                      <rect x="10" y="80" width="20" height="10" />
                      <rect x="40" y="80" width="10" height="10" />
                      <rect x="60" y="70" width="10" height="10" />
                      <rect x="80" y="80" width="10" height="10" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{t('voucher.qr_instructions')}</p>
                <p className="text-xs text-gray-400 mt-1">Ref: {bookingReference}</p>
              </section>
            </div>
          </div>

          {/* Important Notes */}
          <section className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('voucher.important_notes')}</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <p className="text-sm text-amber-800">{t('voucher.note_1')}</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <p className="text-sm text-amber-800">{t('voucher.note_2')}</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <p className="text-sm text-amber-800">{t('voucher.note_3')}</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <p className="text-sm text-amber-800">{t('voucher.note_4')}</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
            <p className="font-medium">EscapaUY - Colonia del Sacramento</p>
            <p className="mt-1">Entidad regulada por el Banco Central del Uruguay</p>
            <p className="mt-1 text-xs">{t('footer.rights_reserved')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
