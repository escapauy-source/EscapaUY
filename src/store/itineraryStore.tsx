import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { isPartnerAvailable, getUnavailabilityReason } from '@/utils/availabilityValidator';
import type { AvailabilitySettings, TimeSlot } from '@/utils/availabilityValidator';
import {
  showClosedDayToast,
  showWrongTimeSlotToast,
  showAvailabilityToast
} from '@/utils/availabilityToasts';
import { Hotel, FullItinerary, PartnerVoucher, BigFiveScores } from '@/types';
import { generatePartnerVouchers } from '@/utils/voucherGenerator';
import { getExchangeRate } from '@/utils/currencyUtils';

export interface Activity {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  price_adult?: number;
  price_child?: number;
  partnerId?: string;
  partnerName?: string;
  availabilitySettings?: AvailabilitySettings | null;
  timeSlot?: TimeSlot;
  image?: string;
}

interface ItineraryDay {
  date: string;
  activities: Activity[];
}

interface ItineraryState {
  days: ItineraryDay[];
  startDate: string | null;
  endDate: string | null;
  itinerary: FullItinerary | null;
  selectedHotel: Hotel | null;
  numberOfNights: number;
  numberOfAdults: number;
  numberOfChildren: number;
  childrenAges: number[];
  residencyCountry: string | null;
  bookingId: string | null;
  vouchers: PartnerVoucher[];
  currency: 'UYU' | 'USD';
  exchangeRate: number;
  setCurrency: (currency: 'UYU' | 'USD') => void;
  setExchangeRate: (rate: number) => void;
  travelGroup: string | null; // 'solo' | 'pareja' | 'familia'
  arrivalTime: string | null;
  bigFiveScores: BigFiveScores | null;
  isHydrated: boolean;
  addActivity: (dayIndex: number, activity: Activity, timeSlot: TimeSlot) => boolean;
  removeActivity: (dayIndex: number, activityId: string) => void;
  moveActivity: (fromDay: number, toDay: number, activityId: string, timeSlot: TimeSlot) => boolean;
  clearItinerary: () => void;
  getTotalCost: () => number;
  suggestAlternative?: (dayIndex: number, originalActivity: Activity) => void;
  setTravelGroup: (group: string | null) => void;
  setArrivalTime: (time: string | null) => void;
  setBigFiveScores: (scores: BigFiveScores | null) => void;
  setSelectedHotel: (hotel: Hotel | null) => void;
  setNumberOfNights: (nights: number) => void;
  setNumberOfAdults: (adults: number) => void;
  setNumberOfChildren: (children: number) => void;
  setChildrenAges: (ages: number[]) => void;
  setResidencyCountry: (country: string) => void;
  setBookingInfo: (info: { hotel: Hotel; nights: number; adults: number; kids: number; kidsAges: number[] }) => void;
  setItinerary: (itinerary: FullItinerary | null) => void;
  setDates: (start: Date | null, end: Date | null) => void;
  generateVouchers: (bookingId: string, fullName: string, nationality: string, stayDuration: number) => boolean;
  initializeExchangeRate: () => Promise<void>;
}

function getDayOfWeek(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

const initialState = {
  isHydrated: false,
  days: [],
  startDate: null,
  endDate: null,
  itinerary: null,
  selectedHotel: null,
  numberOfNights: 1,
  numberOfAdults: 1,
  numberOfChildren: 0,
  childrenAges: [],
  residencyCountry: null,
  bookingId: null,
  vouchers: [],
  travelGroup: null,
  arrivalTime: null,
  bigFiveScores: null,
  currency: 'UYU' as const,
  exchangeRate: 40.0
};

export const useItineraryStore = create<ItineraryState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCurrency: (currency) => set({ currency }),
      setExchangeRate: (rate) => set({ exchangeRate: rate }),
      
      addActivity: (dayIndex, activity, timeSlot) => {
        const state = get();
        const targetDay = state.days[dayIndex];
        
        if (!targetDay) {
          toast.error('Día no válido');
          return false;
        }

        if (activity.partnerId && activity.availabilitySettings) {
          const isAvailable = isPartnerAvailable(
            activity.availabilitySettings,
            new Date(targetDay.date),
            timeSlot
          );
          
          if (!isAvailable) {
            const reason = getUnavailabilityReason(
              activity.availabilitySettings,
              new Date(targetDay.date),
              timeSlot
            );
            
            const dayOfWeek = getDayOfWeek(new Date(targetDay.date));
            const dayConfig = (activity.availabilitySettings.days as any)[dayOfWeek];
            
            if (!dayConfig?.open) {
              showClosedDayToast({
                partnerName: activity.partnerName,
                dayOfWeek: dayOfWeek,
                onSuggestAlternative: state.suggestAlternative
                  ? () => state.suggestAlternative!(dayIndex, activity)
                  : undefined,
              });
            } else if (!dayConfig.slots.includes(timeSlot)) {
              showWrongTimeSlotToast({
                timeSlot: timeSlot,
                partnerName: activity.partnerName,
              });
            } else {
              showAvailabilityToast(
                reason || 'Este establecimiento no está disponible en este horario.',
                {
                  onSuggestAlternative: state.suggestAlternative
                    ? () => state.suggestAlternative!(dayIndex, activity)
                    : undefined,
                }
              );
            }
            
            return false;
          }
        }

        set((state) => ({
          days: state.days.map((day, idx) =>
            idx === dayIndex
              ? {
                  ...day,
                  activities: [...day.activities, { ...activity, timeSlot }],
                }
              : day
          ),
        }));
        
        toast.success(`${activity.name} agregado a tu itinerario`, {
          icon: '✅',
          duration: 3000,
        });
        
        return true;
      },
      
      removeActivity: (dayIndex, activityId) => {
        set((state) => ({
          days: state.days.map((day, idx) =>
            idx === dayIndex
              ? {
                  ...day,
                  activities: day.activities.filter((a) => a.id !== activityId),
                }
              : day
          ),
        }));
        toast.success('Actividad eliminada', { duration: 2000 });
      },
      
      moveActivity: (fromDay, toDay, activityId, timeSlot) => {
        const state = get();
        const fromDayData = state.days[fromDay];
        const toDayData = state.days[toDay];
        
        if (!fromDayData || !toDayData) return false;
        
        const activity = fromDayData.activities.find((a) => a.id === activityId);
        if (!activity) return false;

        if (activity.partnerId && activity.availabilitySettings) {
          const isAvailable = isPartnerAvailable(
            activity.availabilitySettings,
            new Date(toDayData.date),
            timeSlot
          );
          
          if (!isAvailable) {
            const reason = getUnavailabilityReason(
              activity.availabilitySettings,
              new Date(toDayData.date),
              timeSlot
            );
            
            const dayOfWeek = getDayOfWeek(new Date(toDayData.date));
            const dayConfig = (activity.availabilitySettings.days as any)[dayOfWeek];
            
            if (!dayConfig?.open) {
              showClosedDayToast({
                partnerName: activity.partnerName,
                dayOfWeek: dayOfWeek,
                onSuggestAlternative: state.suggestAlternative
                  ? () => state.suggestAlternative!(toDay, activity)
                  : undefined,
              });
            } else if (!dayConfig.slots.includes(timeSlot)) {
              showWrongTimeSlotToast({
                timeSlot: timeSlot,
                partnerName: activity.partnerName,
              });
            } else {
              showAvailabilityToast(
                reason || 'Este establecimiento no está disponible en este horario.',
                {
                  onSuggestAlternative: state.suggestAlternative
                    ? () => state.suggestAlternative!(toDay, activity)
                    : undefined,
                }
              );
            }
            
            return false;
          }
        }

        set((state) => ({
          days: state.days.map((day, idx) => {
            if (idx === fromDay) {
              return {
                ...day,
                activities: day.activities.filter((a) => a.id !== activityId),
              };
            }
            if (idx === toDay) {
              return {
                ...day,
                activities: [...day.activities, { ...activity, timeSlot }],
              };
            }
            return day;
          }),
        }));
        
        return true;
      },
      
      clearItinerary: () => {
        set({ ...initialState });
        toast.success('Itinerario limpiado');
      },
      
      // ✅ MOTOR FINANCIERO CORREGIDO v4.0 - IVA + BENEFICIOS FISCALES
      getTotalCost: () => {
        try {
          const state = get();
          const debugPrefix = '[Motor Financiero v4.0]';
          
          // 📌 FASE 0: Validar estado
          if (!state.selectedHotel && (!state.days || state.days.length === 0)) {
            console.log(`${debugPrefix} Sin hotel ni actividades, retorna 0`);
            return 0;
          }
          
          // 📌 FASE 1: Determinar PAX según tipo de viaje
          let adults = state.numberOfAdults || 1;
          let kids = state.numberOfChildren || 0;
          
          // ✅ Si es PAREJA, forzar adults = 2 y kids = 0
          if (state.travelGroup === 'pareja') {
            adults = 2;
            kids = 0;
          }
          
          // 📌 FASE 2: Determinar residencia y beneficios fiscales
          const isForeignTourist = state.residencyCountry && state.residencyCountry !== 'Uruguay';
          const currency = state.currency || 'UYU';
          
          console.log(`${debugPrefix} Configuración:`, {
            travelGroup: state.travelGroup,
            adults: adults,
            kids: kids,
            nights: state.numberOfNights,
            residency: state.residencyCountry,
            isForeignTourist: isForeignTourist,
            currency: currency
          });

          // 📌 FASE 3: Calcular HOTEL (Precio × Noches)
          let hotelCostBase = 0;
          
          if (state.selectedHotel) {
            const hotel = state.selectedHotel;
            const nights = state.numberOfNights || 1;
            
            // ✅ CORRECCIÓN: pricePerNight es precio por HABITACIÓN, no por persona
            hotelCostBase = hotel.pricePerNight * nights;
            
            console.log(`${debugPrefix} Hotel: ${hotel.name}`, {
              pricePerNight: hotel.pricePerNight,
              nights: nights,
              calculation: `${hotel.pricePerNight} × ${nights} = ${hotelCostBase}`
            });
          }

          // 📌 FASE 4: Calcular ACTIVIDADES (Precio × PAX)
          let activitiesCostBase = 0;
          
          if (state.days && state.days.length > 0) {
            state.days.forEach((day, dayIndex) => {
              if (day.activities && day.activities.length > 0) {
                day.activities.forEach((activity) => {
                  const priceAdult = activity.price_adult ?? activity.price ?? 0;
                  const priceChild = activity.price_child ?? 0;
                  
                  // ✅ Fórmula: (Cant_Adultos × precio_adulto) + (Cant_Niños × precio_niño)
                  const activityCost = (adults * priceAdult) + (kids * priceChild);
                  activitiesCostBase += activityCost;
                  
                  console.log(`${debugPrefix} Actividad: ${activity.name}`, {
                    priceAdult,
                    priceChild,
                    calculation: `(${adults} × ${priceAdult}) + (${kids} × ${priceChild}) = ${activityCost}`
                  });
                });
              }
            });
          }

          console.log(`${debugPrefix} Total base (sin IVA): ${hotelCostBase + activitiesCostBase}`);

          // 📌 FASE 5: Aplicar beneficios fiscales
          let finalTotal = hotelCostBase + activitiesCostBase;
          
          if (isForeignTourist) {
            // ✅ EXTRANJEROS: IVA 0 (Beneficio fiscal)
            console.log(`${debugPrefix} TURISTA EXTRANJERO: IVA 0% aplicado`);
          } else {
            // ✅ URUGUAYOS: IVA ya incluido en precios base
            console.log(`${debugPrefix} RESIDENTE: Precios con IVA incluido`);
          }

          // 📌 FASE 6: Conversión de moneda si es necesario
          if (currency === 'USD' && state.exchangeRate && state.exchangeRate > 0) {
            finalTotal = finalTotal / state.exchangeRate;
            console.log(`${debugPrefix} Conversión USD: / ${state.exchangeRate}`);
          }

          console.log(`${debugPrefix} TOTAL FINAL: ${currency} ${finalTotal.toFixed(2)}`);
          return finalTotal;
          
        } catch (error) {
          console.error('[STORE_CRITICAL] Error:', error);
          return 0;
        }
      },
      
      // ✅ FASE 1: Configurar tipo de viaje y PAX automático
      setTravelGroup: (group) => {
        let adults = get().numberOfAdults;
        let children = get().numberOfChildren;
        
        // ✅ Si es PAREJA: Auto-asignar 2 adultos, 0 niños
        if (group === 'pareja') {
          adults = 2;
          children = 0;
        }
        // ✅ Si es SOLO: 1 adulto, 0 niños
        else if (group === 'solo') {
          adults = 1;
          children = 0;
        }
        // ✅ Si es FAMILIA: Dejar que el usuario lo configure manualmente
        
        console.log('[STORE_DEBUG] setTravelGroup:', { group, adults, children });
        set({ travelGroup: group, numberOfAdults: adults, numberOfChildren: children });
      },
      
      setArrivalTime: (time) => set({ arrivalTime: time }),
      setBigFiveScores: (scores) => set({ bigFiveScores: scores }),
      setSelectedHotel: (hotel) => set({ selectedHotel: hotel, itinerary: null, vouchers: [] }),
      setNumberOfNights: (nights) => set({ numberOfNights: nights, itinerary: null, vouchers: [] }),
      setNumberOfAdults: (adults) => set({ numberOfAdults: adults, itinerary: null, vouchers: [] }),
      setNumberOfChildren: (children) => set({ numberOfChildren: children, itinerary: null, vouchers: [] }),
      setChildrenAges: (ages) => set({ childrenAges: ages, itinerary: null, vouchers: [] }),
      
      setResidencyCountry: (country) => {
        const isForeigner = country !== 'Uruguay';
        set({
          residencyCountry: country,
          // Auto-switch: Extranjeros ven USD, Uruguayos ven UYU
          currency: isForeigner ? 'USD' : 'UYU'
        });
      },
      
      setBookingInfo: (info) => set({
        selectedHotel: info.hotel,
        numberOfNights: info.nights,
        numberOfAdults: info.adults,
        numberOfChildren: info.kids,
        childrenAges: info.kidsAges
      }),
      
      setItinerary: (itinerary) => set({ itinerary }),
      
      setDates: (start, end) => {
        if (!start) {
          set({ startDate: null, endDate: null, days: [], numberOfNights: 1 });
          return;
        }
        
        if (!end) {
          set({
            startDate: start.toISOString(),
            endDate: null,
            days: []
          });
          return;
        }

        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const days: ItineraryDay[] = [];
        const current = new Date(start);
        
        while (current <= end) {
          days.push({
            date: new Date(current).toISOString(),
            activities: [],
          });
          current.setDate(current.getDate() + 1);
        }

        set({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          days,
          numberOfNights: nights
        });
      },
      
      // ✅ GENERACIÓN DE VOUCHERS MEJORADA
      generateVouchers: (bookingId, fullName, nationality, stayDuration) => {
        const state = get();
        
        console.log('[STORE_DEBUG] Generando Vouchers. Validación de Estado:', {
          hasDays: state.days && state.days.length > 0,
          daysCount: state.days?.length || 0,
          hasHotel: !!state.selectedHotel,
          hotelId: state.selectedHotel?.id,
          hotelName: state.selectedHotel?.name,
          adults: state.numberOfAdults,
          kids: state.numberOfChildren,
          currency: state.currency,
          bookingId: bookingId
        });

        // ✅ VALIDACIÓN ESTRICTA
        if (!state.days || state.days.length === 0) {
          console.error('[STORE_DEBUG] FALLO: No hay días en el itinerario');
          toast.error('Error: No hay días en tu itinerario. Por favor crea un itinerario primero.');
          return false;
        }
        
        if (!state.selectedHotel) {
          console.error('[STORE_DEBUG] FALLO: No hay hotel seleccionado');
          toast.error('Error: No has seleccionado un hotel. Por favor selecciona alojamiento.');
          return false;
        }

        // ✅ Construir FullItinerary para el generador
        const fullItinerary: FullItinerary = {
          days: state.days.map((day, idx) => ({
            dayNumber: idx + 1,
            date: day.date,
            location: state.selectedHotel?.city || 'Uruguay',
            periods: day.activities.map(a => ({
              timeSlot: a.timeSlot || 'morning',
              activityId: a.id,
              isResting: false,
              planBActivityId: null,
              planBEnabled: false,
              weatherTriggered: false
            }))
          })),
          hotel: state.selectedHotel!,
          totalPrice: state.getTotalCost(),
          createdAt: new Date().toISOString()
        };

        // ✅ Usar PAX correcto según tipo de viaje
        let adults = state.numberOfAdults;
        if (state.travelGroup === 'pareja') {
          adults = Math.max(adults, 2); // Garantizar mínimo 2 para parejas
        }

        const vouchers = generatePartnerVouchers(
          fullItinerary,
          bookingId,
          adults,
          state.numberOfChildren,
          state.childrenAges,
          fullName,
          nationality,
          stayDuration,
          state.currency,
          state.exchangeRate
        );

        set({
          vouchers,
          bookingId,
          itinerary: fullItinerary
        });

        console.log('[STORE_DEBUG] Vouchers generados correctamente:', {
          count: vouchers.length,
          bookingId: bookingId
        });
        
        return true;
      },
      
      initializeExchangeRate: async () => {
        const { rate } = await getExchangeRate();
        console.log('[Store] Initialized Exchange Rate:', rate);
        set({ exchangeRate: rate });
      },
    }),
    {
      name: 'escapauy_itinerary',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        console.log('[STORE_HYDRATION] Starting hydration check...');
        
        if (!state || typeof state.numberOfNights !== 'number' || !Array.isArray(state.days)) {
          console.warn('[STORE_HYDRATION_ERROR] State corrupt or invalid on load. Performing HARD RESET.');
          useItineraryStore.setState(initialState);
        } else {
          console.log('[STORE_HYDRATION] State rehydrated successfully.');
        }
        
        useItineraryStore.setState({ isHydrated: true });
      },
    }
  )
);

export const useIsHydrated = () => useItineraryStore((state) => state.isHydrated);

export function useDatesAsObjects() {
  const startDate = useItineraryStore((state) => state.startDate);
  const endDate = useItineraryStore((state) => state.endDate);
  
  return {
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  };
}

export function useIsForeigner() {
  const residencyCountry = useItineraryStore((state) => state.residencyCountry);
  return residencyCountry !== null && residencyCountry !== 'Uruguay';
}
