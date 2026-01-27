import type { PartnerVoucher, FullItinerary } from '@/types';
import { activities } from '@/data/mockData';
import { getPartnerById } from '@/data/mockData';
import { calculateTaxBenefits } from './taxUtils';

/**
 * Genera vouchers INDIVIDUALES por cada servicio/actividad del itinerario
 * ⚠️ CRÍTICO: Un QR por servicio, no agrupado por partner
 * @param itinerary Itinerario completo del usuario
 * @param bookingId ID único de la reserva
 * @param adults Número de adultos
 * @param children Número de niños
 * @param childrenAges Edades de los niños
 * @returns Array de vouchers, UNO POR CADA ACTIVIDAD
 */
export function generatePartnerVouchers(
    itinerary: FullItinerary,
    bookingId: string,
    adults: number,
    children: number,
    childrenAges: number[],
    touristName: string,
    touristNationality: string,
    stayDuration: number,
    // Financial Engine v3.0 params
    currency: 'UYU' | 'USD',
    exchangeRate: number
): PartnerVoucher[] {
    const vouchers: PartnerVoucher[] = [];
    const isForeigner = touristNationality !== 'Uruguay'; // Still useful for tax rules, but currency is explicit now
    const paymentDate = new Date().toLocaleDateString('en-GB');

    // 1. HOTEL VOUCHER
    if (itinerary.hotel) {
        const hotel = itinerary.hotel;
        const partner = getPartnerById(hotel.partnerId);
        if (partner) {
            const hAdult = hotel.price_adult ?? hotel.pricePerNight ?? 0;
            const hChild = hotel.price_child ?? 0;
            const grossAmount = stayDuration * ((adults * hAdult) + (children * hChild));

            const taxRes = calculateTaxBenefits({
                items: [{ category: 'hotel', grossAmount }],
                isNonUruguayanResident: isForeigner,
                paidElectronically: true
            });

            // Currency Conversion Logic v3.0 - ROBUSTNESS FIX
            const safeExchangeRate = (exchangeRate && exchangeRate > 0) ? exchangeRate : 40.0;
            const finalCurrency = currency;
            const finalRate = currency === 'USD' ? safeExchangeRate : 1;

            // Convert amounts if needed
            const totalPartnerAmount = finalCurrency === 'USD' ? (taxRes.finalTotal / finalRate) : taxRes.finalTotal;
            const grossTotal = finalCurrency === 'USD' ? (grossAmount / finalRate) : grossAmount;
            const depositPaid = finalCurrency === 'USD' ? (taxRes.depositWeb / finalRate) : taxRes.depositWeb;
            const balanceDue = finalCurrency === 'USD' ? (taxRes.balanceLocal / finalRate) : taxRes.balanceLocal;

            // Calculate dates
            const startDate = itinerary.days[0]?.date || new Date().toISOString();
            const endDateObj = new Date(startDate);
            endDateObj.setDate(endDateObj.getDate() + stayDuration);
            const endDate = endDateObj.toISOString();

            vouchers.push({
                voucherId: `V-${bookingId}-HOTEL-${Date.now().toString(36).toUpperCase()}`,
                bookingId,
                partnerId: partner.id,
                partnerName: partner.name,
                partnerRazonSocial: partner.razonSocial || 'Razón Social No Disponible', // Fallback safety
                partnerRUT: partner.rut || 'RUT No Disponible',
                partnerLegalAddress: partner.legalAddress || 'Dirección No Disponible',
                partnerPhone: partner.phone,
                touristName,
                touristNationality,
                stayDuration,
                startDate,
                endDate,
                currency: finalCurrency,
                exchangeRateSnapshot: finalRate,
                exchangeRateDisclaimer: isForeigner ? `Price adjusted to the exchange rate of the payment date (${paymentDate}). Exchange rate applied: 1 USD = ${finalRate.toFixed(2)} UYU` : undefined,
                nativeTotal: taxRes.finalTotal, // Original UYU Amount
                services: [{
                    category: 'accommodation',
                    activityId: hotel.id,
                    activityName: hotel.name,
                    date: startDate,
                    dayNumber: 1,
                    timeSlot: 'evening',
                    pax: { adults, children, childrenAges: [...childrenAges] },
                    price: grossTotal // Stored in displaying currency
                }],
                totalPartnerAmount,
                totalAmount: totalPartnerAmount, // Alias
                grossTotal,
                taxBenefitSavings: finalCurrency === 'USD' ? (taxRes.totalDiscount / finalRate) : taxRes.totalDiscount,
                depositPaid,
                balanceDue,
                qrValidationUrl: `${window.location.origin}/validate/${bookingId}/hotel/${hotel.id}`,
                createdAt: new Date().toISOString()
            });
        } else {
            console.error(`[VOUCHER_GEN_ERROR] Hotel partner not found for ID: ${hotel.partnerId}`);
        }
    }

    // 2. ACTIVITY VOUCHERS
    itinerary.days.forEach((day) => {
        day.periods.forEach((period) => {
            if (!period.activityId) return;

            const activity = activities.find((a) => a.id === period.activityId);
            if (!activity) return;

            const partner = getPartnerById(activity.partnerId);
            if (!partner) return;

            const pAdult = activity.price_adult ?? activity.price ?? 0;
            const pChild = activity.price_child ?? 0; // Check specific handling
            const grossAmount = (adults * pAdult) + (children * pChild);

            const taxRes = calculateTaxBenefits({
                items: [{
                    category: activity.category === 'restaurante' ? 'restaurante' : 'actividad',
                    grossAmount,
                    vatBenefitOverride: (activity as any).vat_benefit
                }],
                isNonUruguayanResident: isForeigner,
                paidElectronically: true
            });

            // Currency Conversion Logic v3.0 - ROBUSTNESS FIX
            const safeExchangeRate = (exchangeRate && exchangeRate > 0) ? exchangeRate : 40.0;
            const finalCurrency = currency;
            const finalRate = currency === 'USD' ? safeExchangeRate : 1.0;

            // Convert amounts if needed
            const totalPartnerAmount = finalCurrency === 'USD' ? (taxRes.finalTotal / finalRate) : taxRes.finalTotal;
            const grossTotalVal = finalCurrency === 'USD' ? (grossAmount / finalRate) : grossAmount;
            const depositPaid = finalCurrency === 'USD' ? (taxRes.depositWeb / finalRate) : taxRes.depositWeb;
            const balanceDue = finalCurrency === 'USD' ? (taxRes.balanceLocal / finalRate) : taxRes.balanceLocal;

            vouchers.push({
                voucherId: `V-${bookingId}-${activity.id}-${Date.now().toString(36).toUpperCase()}`,
                bookingId,
                partnerId: partner.id,
                partnerName: partner.name,
                partnerRazonSocial: partner.razonSocial || 'Razón Social No Disponible',
                partnerRUT: partner.rut || 'RUT No Disponible',
                partnerLegalAddress: partner.legalAddress || 'Dirección No Disponible',
                partnerPhone: partner.phone,
                touristName,
                touristNationality,
                stayDuration: 0,
                startDate: day.date,
                endDate: day.date,
                currency: finalCurrency,
                exchangeRateSnapshot: finalRate,
                exchangeRateDisclaimer: finalCurrency === 'USD' ? `Price adjusted to the exchange rate of the payment date (${paymentDate}). Exchange rate applied: 1 USD = ${finalRate.toFixed(2)} UYU` : undefined,
                nativeTotal: taxRes.finalTotal, // Original UYU Amount
                services: [{
                    category: activity.category,
                    activityId: activity.id,
                    activityName: activity.name,
                    date: day.date,
                    dayNumber: day.dayNumber,
                    timeSlot: period.timeSlot,
                    pax: { adults, children, childrenAges: [...childrenAges] },
                    price: grossTotalVal
                }],
                totalPartnerAmount,
                totalAmount: totalPartnerAmount, // Alias
                grossTotal: grossTotalVal,
                taxBenefitSavings: finalCurrency === 'USD' ? (taxRes.totalDiscount / finalRate) : taxRes.totalDiscount,
                depositPaid,
                balanceDue,
                qrValidationUrl: `${window.location.origin}/validate/${bookingId}/${activity.id}`,
                createdAt: new Date().toISOString()
            });
        });
    });

    return vouchers;
}

/**
 * Genera un ID único de reserva
 */
export function generateBookingId(): string {
    return `ESC-${Date.now().toString(36).toUpperCase()}`;
}
