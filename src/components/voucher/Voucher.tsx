import React from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '../../stores/authStore';
import { generateBookingReference } from '../../utils/bookingUtils';
import { MapPin, ExternalLink, Calendar, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// New interface for a single voucher item
export interface VoucherItem {
  id: string;
  type: 'hotel' | 'activity';
  providerName: string;
  itemName: string;
  address: string;
  phone: string;
  email: string;
  date: string; // Check-in or Activity Date
  time?: string; // For activities
  endDate?: string; // Check-out for hotels

  // Price breakdown for THIS item
  priceAdult: number;
  priceChild: number;
  totalPrice: number; // Gross

  // Tax details
  isForeigner: boolean;
  taxSavings: number; // IVA discount

  // Payment split
  depositAmount: number; // 15%
  remainingAmount: number; // 85%

  pax: {
    adults: number;
    children: number;
  };

  // Optional: associated persistent reference code
  reference?: string;
}

interface VoucherProps {
  user: User;
  item: VoucherItem;
  onDownload: () => void;
  onShare: () => void;
  onAddToCalendar: () => void;
  currency?: 'UYU' | 'USD';
}

export const Voucher: React.FC<VoucherProps> = ({
  user,
  item,
  onDownload,
  onShare,
  onAddToCalendar,
  currency = 'UYU'
}) => {
  const { t, i18n } = useTranslation();
  const currencySymbol = currency === 'USD' ? 'U$S' : '$';

  // Use persistent ref if provided, otherwise generate (fallback)
  const voucherRef = item.reference || generateBookingReference();
  const locale = i18n.language.startsWith('en') ? 'en-US' : 'es-UY';
  const today = new Date().toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Math rounding fixes
  const regularPrice = Math.round(item.totalPrice);
  const taxSavings = Math.round(item.taxSavings);
  const finalTotal = Math.max(0, regularPrice - taxSavings);
  const deposit = item.totalPrice > 0 ? Math.round(finalTotal * 0.15) : 0;
  const balance = finalTotal - deposit;

  // Enriched QR Code data specific to this voucher
  const qrData = JSON.stringify({
    ref: voucherRef,
    item: item.itemName,
    provider: item.providerName,
    client: user.name || user.email,
    date: item.date,
    pax: item.pax,
    balanceDue: balance.toString(),
  });

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.providerName} ${item.address} ${item.address.includes('Colonia') ? '' : 'Colonia Uruguay'}`)}`;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mb-8 print:shadow-none print:mb-0 print:border">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                {item.type === 'hotel' ? t('voucher.hotel_type', 'Alojamiento') : t('voucher.activity_type', 'Experiencia')}
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-1">{item.providerName}</h1>
            <p className="text-blue-100 text-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {item.address}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
              <p className="text-[10px] text-blue-200 uppercase tracking-widest">{t('voucher.booking_reference')}</p>
              <p className="text-xl font-mono font-bold tracking-tight">{voucherRef}</p>
            </div>
            <p className="text-[10px] mt-2 text-blue-200 opacity-80">
              {t('voucher.issued', 'Emitido:')} {today}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">

        {/* Left: Details */}
        <div className="md:col-span-2 p-6 space-y-6">

          {/* Date & Time Row */}
          <div className="flex gap-4">
            <div className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold uppercase mb-1">{item.type === 'hotel' ? t('voucher.check_in', 'Check-in') : t('voucher.date_label', 'Fecha')}</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-700" />
                <p className="text-lg font-bold text-gray-800">
                  {new Date(item.date).toLocaleDateString('es-UY', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              {item.time && (
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {item.time === 'morning' ? t('voucher.morning') :
                    item.time === 'midday' ? t('voucher.midday') :
                      item.time === 'afternoon' ? t('voucher.afternoon') : t('voucher.night')}
                </div>
              )}
            </div>

            {item.endDate && (
              <div className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-blue-600 font-semibold uppercase mb-1">{t('voucher.check_out', 'Check-out')}</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-700" />
                  <p className="text-lg font-bold text-gray-800">
                    {new Date(item.endDate).toLocaleDateString('es-UY', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Item Details */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">{t('voucher.service_details')}</h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="font-semibold text-lg text-gray-900 mb-1">{item.itemName}</p>
              <div className="flex gap-4 text-sm text-gray-600 mt-2">
                <span>👥 {t('voucher.adults_count', { count: item.pax.adults })}{item.pax.children > 0 ? `, ${t('voucher.children_count', { count: item.pax.children })}` : ''}</span>
                <span className="text-gray-300">|</span>
                <span>📞 {item.phone}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  {t('voucher.view_map')}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Traveler */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{t('voucher.reservation_holder')}</h3>
            <p className="font-medium text-gray-800">{user.name} <span className="text-gray-400 font-normal">| {user.nationality || 'Uruguay'} | {user.documentNumber || user.id}</span></p>
          </div>
        </div>

        {/* Right: Payment */}
        <div className="p-6 bg-gray-50/50">
          <div className="h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">{t('voucher.payment_breakdown')}</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{t('voucher.regular_price')}</span>
                  <span>{currencySymbol} {regularPrice}</span>
                </div>

                {taxSavings > 0 && (
                  <div className="flex justify-between text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                    <span>{item.isForeigner ? t('voucher.tax_benefit_foreigner') : t('voucher.tax_benefit_iva')}</span>
                    <span>-{currencySymbol} {taxSavings}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 my-2"></div>

                <div className="flex justify-between text-gray-800 font-bold text-lg">
                  <span>{t('voucher.total')}</span>
                  <span>{item.totalPrice === 0 ? t('voucher.free_caps') : `${currencySymbol} ${finalTotal}`}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {/* Deposit - Only show if > 0 or if free (as $0) */}
                {item.totalPrice > 0 ? (
                  <div className="bg-blue-100 p-3 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center text-blue-800">
                      <span className="text-xs font-bold uppercase">Seña abonada a EscapaUY (15%)</span>
                      <span className="font-bold">{currencySymbol} {deposit}</span>
                    </div>
                    <p className="text-[10px] text-blue-600 mt-1">Pago ya procesado · Este voucher lo confirma</p>
                  </div>
                ) : (
                  <div className="bg-green-100 p-3 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center text-green-800">
                      <span className="text-xs font-bold uppercase">{t('voucher.reservation_confirmed_tag')}</span>
                      <span className="font-bold">✓</span>
                    </div>
                  </div>
                )}

                {/* Balance */}
                {item.totalPrice > 0 ? (
                  <div className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-500 shadow-sm">
                    <p className="text-xs text-amber-700 font-bold uppercase mb-1">💵 Saldo a pagar en el local</p>
                    <p className="text-3xl font-extrabold text-amber-700 tracking-tight">
                      {currencySymbol} {balance}
                    </p>
                    <p className="text-[10px] text-amber-600 mt-1">Abonás esta diferencia directamente a {item.providerName} al momento de la visita · Precio orientativo</p>
                  </div>
                ) : (
                  <div className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-500 shadow-sm">
                    <p className="text-xs text-amber-700 font-bold uppercase mb-1">{t('voucher.contribution')}</p>
                    <p className="text-xl font-extrabold text-amber-600 tracking-tight">
                      {t('voucher.voluntary')}
                    </p>
                    <p className="text-[10px] text-amber-500 mt-1">{t('voucher.accept_collaborations')}</p>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="bg-gray-50 p-3 rounded-lg flex items-start gap-2 text-[10px] text-gray-500 mt-4 border border-gray-200">
                <span className="mt-0.5">ℹ️</span>
                <p>EscapaUY no gestiona reservas de alojamiento directamente. Los precios son orientativos. El saldo se abona al partner en destino.</p>
              </div>
            </div>

            {/* QR - prominente, para imprimir y presentar en el local */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">📲 Presentar en el local</p>
              <div className="w-full flex justify-center mb-2">
                <div className="p-3 bg-white border-2 border-gray-800 rounded-xl shadow-sm">
                  <QRCodeSVG
                    value={qrData}
                    size={120}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 font-mono mb-1">{voucherRef}</p>
              <p className="text-[10px] text-gray-400">Mostrá o imprimí este QR en {item.providerName} para confirmar tu reserva y abonar el saldo</p>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Instructions */}
      <div className="bg-gray-800 px-6 py-3 text-[10px] text-gray-300 flex justify-between items-center">
        <p>🖨️ Imprimí o mostrá este voucher en <strong className="text-white">{item.providerName}</strong> · Pagás el saldo directamente allí</p>
        <div className="flex gap-3">
          <button key="dl" onClick={onDownload} className="hover:text-white font-semibold">{t('voucher.download_pdf')}</button>
          <button key="share" onClick={onShare} className="hover:text-white font-semibold">{t('voucher.share')}</button>
        </div>
      </div>
    </div>
  );
};
