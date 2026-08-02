// Configuration Constants
// Centralized constants for business logic and configuration

// Financial
export const DEPOSIT_PERCENTAGE = 0.15; // 15% web deposit
export const LOCAL_BALANCE_PERCENTAGE = 0.85; // 85% pay at venue

// Tax Benefits (Ley 19.253)
export const IVA_RATE = 0.22; // 22% IVA standard
export const IVA_DISCOUNT_ACCOMMODATION = 0.22; // Full 22% for foreign tourists
export const IVA_DISCOUNT_GASTRONOMY_POINTS = 9; // 9 percentage points (22% -> 13%)

// Itinerary Limits
export const MIN_NIGHTS = 1;
export const MAX_NIGHTS = 7;
export const MIN_ADULTS = 1;
export const MAX_ADULTS = 10;
export const MAX_CHILDREN = 5;

// Time Slots
export const TIME_SLOTS = ['morning', 'afternoon', 'evening'] as const;

// localStorage Keys
export const STORAGE_KEYS = {
    BIG_FIVE_SCORES: 'escapauy_bigFiveScores',
    TRAVEL_GROUP: 'escapauy_travelGroup',
    SELECTED_HOTEL: 'escapauy_selectedHotel',
    ARRIVAL_TIME: 'escapauy_arrivalTime',
    NUMBER_OF_NIGHTS: 'escapauy_numberOfNights',
    NUMBER_OF_ADULTS: 'escapauy_numberOfAdults',
    NUMBER_OF_CHILDREN: 'escapauy_numberOfChildren',
    CHILDREN_AGES: 'escapauy_childrenAges',
} as const;

// Big Five Trait Ranges
export const BIG_FIVE_RANGES = {
    LOW: 0,
    MEDIUM: 50,
    HIGH: 100,
} as const;

// Weather Conditions
export const WEATHER_CONDITIONS = {
    SUNNY: 'sunny',
    CLOUDY: 'cloudy',
    RAINY: 'rainy',
    STORMY: 'stormy',
} as const;

export const RAIN_PROBABILITY_THRESHOLD = 40; // % - activate Plan B

// Proximity/Distance
export const DEFAULT_PROXIMITY_RADIUS_KM = 50; // km radius for activity search

// Animation Durations (ms)
export const ANIMATION_DURATION = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
} as const;

// Legal & Compliance
export const KYC_RETENTION_YEARS = 5; // Ley 20.352
export const CONSUMER_RETRACTION_DAYS = 5; // Ley 17.250 (not applicable for dated services)

// Booking Status
export const BOOKING_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    WEATHER_CANCELLED: 'weather_cancelled',
    REFUNDED: 'refunded',
} as const;

// Activity Categories
export const ACTIVITY_CATEGORIES = [
    'bodega',
    'museo',
    'restaurante',
    'paseo',
    'playa',
    'parque',
    'experiencia',
    'evento',
] as const;

// Contact
export const SUPPORT_EMAIL = 'escapauy@gmail.com';
export const COMPANY_NAME = 'EscapaUY';

// Social Media Links
export const SOCIAL_LINKS = {
    INSTAGRAM: 'https://instagram.com/escapauy',
    FACEBOOK: 'https://facebook.com/escapauy',
    WHATSAPP: 'https://wa.me/59891234567', // Ejemplo de número uruguayo
} as const;

// QR Code
export const QR_VALIDATION_BASE_URL = 'https://escapauy.com/verify/';
