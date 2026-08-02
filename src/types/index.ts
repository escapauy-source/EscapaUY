// Basic Types
export type LocalizedString = {
  es: string;
  en: string;
};

export interface User {
  id: string;
  email: string;
  role: 'tourist' | 'partner' | 'admin';
  fullName: string;
  bigFiveScores?: BigFiveScores;
  ia_insight?: any; // JSONB storage for AI analysis
  trip_duration?: number; // Total nights planned
  companion_type?: string; // Solo, Couple, Family, Friends
  originCountry?: string;
  kycData?: KYCData;
  isPep?: boolean;
}

export interface KYCData {
  docNumber: string;
  dob: string;
  phone: string;
}

export interface BigFiveScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface TraitScenario {
  id: string;
  traitName: string;
  traitKey: keyof BigFiveScores;
  description: string;
  optionA: TraitOption;
  optionB: TraitOption;
  optionC: TraitOption;
}

export interface TraitOption {
  imgUrl: string;
  title: string;
  description: string;
  scoreValue: number;
}

export interface Partner {
  id: string;
  razonSocial: string;
  rut: string;
  legalAddress: string;
  beneficiaryFinal: string;
  name: string;
  category: 'bodega' | 'hotel' | 'restaurant' | 'museum' | 'activity';
  logo?: string;
  phone?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Hotel {
  id: string;
  partnerId: string;
  name: LocalizedString;
  address: string;
  city: string;
  description: LocalizedString;
  images: string[];
  rating: number;
  stars: number;
  pricePerNight: number;
  price_adult?: number;
  price_child?: number;
  amenities: string[];
  rooms: number;
  currentOccupancy: number;
  maxGuests: number;
  childrenFriendly?: boolean;
  cribsAvailable?: number;
  coordinates?: Coordinates; // Temporary optional - add coordinates to all hotels
  reviewsCount?: number;
}

export interface Activity {
  id: string;
  partnerId: string;
  partnerName: string;
  name: LocalizedString;
  city: string;
  type: 'indoor' | 'outdoor';
  weatherResilient: boolean;
  capacity: number;
  currentOccupancy: number;
  images: string[];
  description: LocalizedString;
  price: number;
  price_adult?: number;
  price_child?: number;
  vat_benefit?: number;
  rating: number;
  duration: string;
  bestTime?: string;
  category: string;
  kidsFriendly?: boolean;
  minAge?: number;
  maxAge?: number;
  planBAlternativeId?: string;
  coordinates?: Coordinates;
  isFree?: boolean;
  reviewsCount?: number;
}

export interface ItineraryBlock {
  id: string;
  time: string;
  planA: Activity;
  planB?: Activity;
  isActive: boolean;
  weatherTriggered: boolean;
}

export interface Itinerary {
  id: string;
  userId?: string;
  date: string;
  blocks: ItineraryBlock[];
  status: 'draft' | 'confirmed' | 'active' | 'completed';
}

export interface Booking {
  id: string;
  itineraryId: string;
  totalPriceIncTax: number;
  depositHeld: number;
  status: 'pending' | 'confirmed' | 'weather_cancelled' | 'refunded';
  legalConsentLog?: string;
  createdAt: string;
}

export interface WeatherData {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  rainProbability: number;
  humidity: number;
  wind: number;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  time: string;
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  rainProbability: number;
}

// Enhanced Itinerary Types for Plan A/B System
export type TimeSlot = 'morning' | 'midday' | 'afternoon' | 'evening';

export interface DayPeriod {
  timeSlot: TimeSlot;
  activityId: string | null; // null = descanso
  isResting: boolean;
  planBActivityId: string | null; // Plan B si la actividad principal es outdoor
  planBEnabled: boolean; // User can toggle Plan B on/off
  weatherTriggered: boolean; // true si se activó Plan B por clima
}

export interface ItineraryDayComplete {
  dayNumber: number;
  date: string; // ISO String
  periods: DayPeriod[];
  location: string; // ciudad base para este día
}

export interface FullItinerary {
  days: ItineraryDayComplete[];
  hotel: Hotel;
  totalPrice: number;
  createdAt: string;
}

// Partner Voucher - Individual voucher per partner with QR code
export interface PartnerVoucher {
  voucherId: string;
  bookingId: string;
  partnerId: string;
  partnerName: string;
  partnerRazonSocial: string;
  partnerRUT: string;
  partnerLegalAddress: string;
  partnerPhone?: string;

  touristName: string;
  touristNationality: string;
  stayDuration?: number; // Para hoteles: cantidad de noches

  // Date Fields for UI
  startDate: string; // ISO String
  endDate: string;   // ISO String

  // Financial Engine v2.0
  currency?: string; // UYU or USD
  exchangeRateSnapshot?: number;
  exchangeRateDisclaimer?: string;
  nativeTotal?: number; // Monto original en UYU para referencia

  services: {
    category: string; // 'hotel', 'accommodation', 'activity', 'restaurante'
    activityId: string;
    activityName: string;
    date: string;
    dayNumber: number;
    timeSlot: TimeSlot;
    pax: {
      adults: number;
      children: number;
      childrenAges: number[];
    };
    price: number;
  }[];

  totalPartnerAmount: number;
  totalAmount?: number; // Alias for UI compatibility (same as totalPartnerAmount)
  grossTotal: number;
  taxBenefitSavings: number;
  depositPaid: number; // 15% of totalPartnerAmount
  balanceDue: number; // 85% of totalPartnerAmount

  qrValidationUrl: string;
  createdAt: string;
}

// Legacy types (mantener para compatibilidad)
export interface ItineraryActivity {
  activityId: string;
  timeSlot: 'morning' | 'midday' | 'afternoon' | 'evening';
  planB?: string;
  // Loose properties to support UI extensions without breaking legacy
  name?: string;
  price?: number;
  duration?: string;
  indoor?: boolean;
  [key: string]: any;
}

export interface ItineraryDay {
  dayNumber: number;
  date?: string; // Added to fix error in AdnViajeroPage
  activities: ItineraryActivity[];
  notes?: string;
  freeTime?: boolean; // Added for UI logic
  recommendations?: any[]; // Added for UI logic
}

// Blog System Types
export interface BlogPost {
  id: string;
  title: string;
  title_en: string; // NEW: Bilingual support
  slug: string;
  content: string; // HTML or Markdown (ES)
  content_en: string; // NEW: English version
  author_id: string;
  featured_image?: string;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  placeId: string; // Hotel or Activity ID
  placeName?: string;
}

export interface PaymentSummary {
  nights: number;
  adults: number;
  children: number;
  subtotal: number;
  ivaSavings: number;
  total: number;
  depositAmount: number;
  remainingAmount: number;
  hotelTaxSavings?: number;
  restaurantSavings?: number;
  checkInDate?: string;
  checkOutDate?: string;
}
