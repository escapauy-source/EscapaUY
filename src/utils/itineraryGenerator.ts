import { activities, hotels, getActivitiesByCity } from '../data/mockData';

interface ItineraryOption {
    id: 'classic' | 'discovery' | 'saver';
    title: string;
    description: string;
    totalPrice: number;
    originalPrice: number; // For savings calculation
    savings: number;
    hotel: typeof hotels[0];
    activities: any[]; // Extended Activity Selection
    badge?: string;
}


// Helper: Get Net Price
const getNetPrice = (price: number, category: string, isForeigner: boolean): number => {
    if (!isForeigner) return price; // Locals pay full price
    // Gastronomy: 22% off (divide by 1.22)
    if (category === 'restaurante' || category === 'gastronomy') return price / 1.22;
    // Hotels: 0% VAT (Price is already 0% VAT usually, but let's assume no extra discount on list price for now unless specified)
    return price;
};

export const generateItineraryOptions = (
    config: any,
    isForeigner: boolean
): ItineraryOption[] => {
    const currency = config.currency || 'UYU';
    const exchangeRate = 42;
    // Convert User Budget to Pesos for calculation
    const budgetLimit = (config.budget || 100000) * (currency === 'USD' ? exchangeRate : 1);

    // --- STRATEGY: RESPECT SELECTED HOTEL IF AVAILABLE ---
    const selectedHotel = config.hotel;

    if (selectedHotel) {
        // Calculate remaining budget for activities
        const totalBudget = budgetLimit;
        const hotelCost = selectedHotel.pricePerNight * getNights(config);
        const activityBudget = Math.max(0, totalBudget - hotelCost);

        // Common Pool: Activities in the selected hotel's city
        // Fallback to all activities if city has none (shouldn't happen with correct mocks)
        const cityActivities = getActivitiesByCity(selectedHotel.city);
        const pool = cityActivities.length > 0 ? cityActivities : activities;

        // --- 1. BALANCED (Classic match) ---
        const balancedActivities = selectActivities(
            pool,
            activityBudget, // Use full remaining budget
            config,
            isForeigner,
            'balanced'
        );

        const balancedOption = {
            id: 'classic' as const,
            title: 'Equilibrado',
            description: `Un mix ideal de actividades en ${selectedHotel.city}.`,
            totalPrice: calculateTotal(selectedHotel, balancedActivities, config, isForeigner),
            originalPrice: calculateTotal(selectedHotel, balancedActivities, config, false),
            savings: 0,
            hotel: selectedHotel,
            activities: balancedActivities,
            badge: 'Recomendado'
        };
        balancedOption.savings = balancedOption.originalPrice - balancedOption.totalPrice;

        // --- 2. PREMIUM (Discovery match) ---
        // Try to utilize budget for best experiences
        const premiumActivities = selectActivities(
            pool,
            activityBudget,
            config,
            isForeigner,
            'premium'
        );

        const premiumOption = {
            id: 'discovery' as const,
            title: 'Experiencia Total',
            description: 'Las mejores experiencias para disfrutar al máximo.',
            totalPrice: calculateTotal(selectedHotel, premiumActivities, config, isForeigner),
            originalPrice: calculateTotal(selectedHotel, premiumActivities, config, false),
            savings: 0,
            hotel: selectedHotel,
            activities: premiumActivities,
            badge: 'Más Completo'
        };
        premiumOption.savings = premiumOption.originalPrice - premiumOption.totalPrice;


        // --- 3. SAVER (Smart Saver match) ---
        // Try to save money (Target 60% of activity budget or just cheap ones)
        const saverActivities = selectActivities(
            pool,
            activityBudget * 0.6, // Artificially constrain budget
            config,
            isForeigner,
            'saver'
        );

        const saverOption = {
            id: 'saver' as const,
            title: 'Económico',
            description: 'Disfruta cuidando tu bolsillo.',
            totalPrice: calculateTotal(selectedHotel, saverActivities, config, isForeigner),
            originalPrice: calculateTotal(selectedHotel, saverActivities, config, false),
            savings: 0,
            hotel: selectedHotel,
            activities: saverActivities,
            badge: 'Mejor Precio'
        };
        saverOption.savings = saverOption.originalPrice - saverOption.totalPrice;

        return [balancedOption, premiumOption, saverOption];
    }

    // --- FALLBACK LOGIC (If no hotel selected - Legacy/Fallback) ---
    // --- 1. CLASSIC & CENTRIC (Colonia del Sacramento) ---
    // Strategies: Best Hotel in Colonia + Max Activities
    const classicHotel = hotels.find(h => h.city === 'Colonia del Sacramento') || hotels[0];
    const classicBudget = budgetLimit * 0.95;
    const classicActivities = selectActivities(
        getActivitiesByCity('Colonia del Sacramento'),
        classicBudget - (classicHotel.pricePerNight * getNights(config)),
        config,
        isForeigner
    );

    const classicOption = {
        id: 'classic' as const,
        title: 'Clásico & Céntrico',
        description: 'La experiencia tradicional en el corazón del Barrio Histórico.',
        totalPrice: calculateTotal(classicHotel, classicActivities, config, isForeigner),
        originalPrice: calculateTotal(classicHotel, classicActivities, config, false),
        savings: 0, // Calculated below
        hotel: classicHotel,
        activities: classicActivities,
        badge: 'Más Popular'
    };
    classicOption.savings = classicOption.originalPrice - classicOption.totalPrice;


    // --- 2. DISCOVERY REGIONAL (Carmelo / Nueva Helvecia) ---
    // Strategies: Cheaper Hotel + Premium Activities
    // Find a hotel NOT in Colonia (or cheaper one)
    const regionalHotels = hotels.filter(h => h.city !== 'Colonia del Sacramento');
    const discoveryHotel = regionalHotels.length > 0 ? regionalHotels[0] : hotels[1];

    // Available budget might be higher due to cheaper hotel
    const discoveryBudget = budgetLimit;
    const discoveryActivities = selectActivities(
        activities, // All activities allowed/preferred regional
        discoveryBudget - (discoveryHotel.pricePerNight * getNights(config)),
        config,
        isForeigner,
        'premium' // prioritizePremium
    );

    const discoveryOption = {
        id: 'discovery' as const,
        title: 'Descubrimiento Regional',
        description: 'Joyas ocultas en Carmelo y Nueva Helvecia con experiencias premium.',
        totalPrice: calculateTotal(discoveryHotel, discoveryActivities, config, isForeigner),
        originalPrice: calculateTotal(discoveryHotel, discoveryActivities, config, false),
        savings: 0,
        hotel: discoveryHotel,
        activities: discoveryActivities,
        badge: 'Experiencia Premium'
    };
    discoveryOption.savings = discoveryOption.originalPrice - discoveryOption.totalPrice;


    // --- 3. SMART SAVER (70% Budget) ---
    // Strategies: Good Hotel + Free/Cheap Activities to save money
    const saverBudget = budgetLimit * 0.7;
    const saverHotel = hotels.sort((a, b) => a.pricePerNight - b.pricePerNight)[0]; // Cheapest
    const saverActivities = selectActivities(
        activities,
        saverBudget - (saverHotel.pricePerNight * getNights(config)),
        config,
        isForeigner
    );

    const saverOption = {
        id: 'saver' as const,
        title: 'Smart Saver',
        description: 'Disfruta al máximo optimizando tu presupuesto.',
        totalPrice: calculateTotal(saverHotel, saverActivities, config, isForeigner),
        originalPrice: calculateTotal(saverHotel, saverActivities, config, false),
        savings: 0,
        hotel: saverHotel,
        activities: saverActivities,
        badge: 'Mejor Precio'
    };
    saverOption.savings = saverOption.originalPrice - saverOption.totalPrice;

    return [classicOption, discoveryOption, saverOption];
};

// --- Helpers ---

// Helpers
const getNights = (config: any) => {
    if (!config.dates.start || !config.dates.end) return 1;
    const start = new Date(config.dates.start);
    const end = new Date(config.dates.end);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (86400000)));
};

const calculateTotal = (hotel: any, acts: any[], config: any, isForeigner: boolean) => {
    const nights = getNights(config);
    const adults = config.groupDetails?.adults || 2;
    const children = config.groupDetails?.children || 0;
    const totalPax = adults + children;

    let total = 0;
    // Hotel
    total += getNetPrice(hotel.pricePerNight, 'hotel', isForeigner) * nights;

    // Activities
    acts.forEach(day => {
        Object.values(day).forEach((sel: any) => {
            if (sel?.activity?.price && !sel.resting) {
                total += getNetPrice(sel.activity.price, sel.activity.category, isForeigner) * totalPax;
            }
        });
    });

    return total;
};

// Check if slot is blocked logic (duplicated to avoid dependency circle, keep simple)
const isBlocked = (dayIndex: number, time: string, arrivalTime: string | null) => {
    if (dayIndex > 0) return false;
    if (!arrivalTime) return false;
    const order = ['morning', 'midday', 'afternoon', 'evening'];
    return order.indexOf(time) < order.indexOf(arrivalTime);
};

const selectActivities = (
    pool: typeof activities,
    budgetForActivities: number,
    config: any,
    isForeigner: boolean,
    strategy: 'balanced' | 'premium' | 'saver' = 'balanced'
) => {
    const nights = getNights(config);
    const days: any[] = [];
    let currentSpent = 0;
    const adults = config.groupDetails?.adults || 2;
    const children = config.groupDetails?.children || 0;
    const totalPax = adults + children;
    const arrivalTime = config.arrivalTime;

    // Filter pool by budget cap per item (heuristic)
    let available = [...pool];

    // v282: Better Sorting based on Strategy
    if (strategy === 'premium') {
        // Most expensive first
        available.sort((a, b) => b.price - a.price);
    } else if (strategy === 'saver') {
        // Cheapest first
        available.sort((a, b) => a.price - b.price);
    } else {
        // Balanced: Shuffle for randomness
        available.sort(() => Math.random() - 0.5);
    }

    for (let d = 0; d < nights; d++) {
        const daySchedule: any = {};

        ['morning', 'midday', 'afternoon', 'evening'].forEach(time => {
            // v282: Skip blocked slots to save budget!
            if (isBlocked(d, time, arrivalTime)) {
                daySchedule[time] = { activityId: null, resting: true, blocked: true };
                return;
            }

            // Find suitable activity
            // v282: Try to find "affordable" first, if fails try "free"
            let candidate = available.find(a =>
                a.bestTime === time &&
                (currentSpent + (getNetPrice(a.price, a.category, isForeigner) * totalPax)) <= budgetForActivities
            );

            // v282: Fallback to FREE activity if budget is tight
            if (!candidate) {
                candidate = available.find(a => a.bestTime === time && a.price === 0);
            }

            if (candidate) {
                daySchedule[time] = {
                    activityId: candidate.id,
                    activity: candidate,
                    resting: false,
                    planBEnabled: true,
                    planBActivityId: null
                };

                // v282: Basic Rain Check Simulation 
                const rainChance = Math.random();
                if (rainChance > 0.7 && candidate.type !== 'indoor') {
                    const indoorAlt = pool.find(a => a.type === 'indoor' && a.id !== candidate.id);
                    if (indoorAlt) {
                        daySchedule[time].planBActivityId = indoorAlt.id;
                    }
                }

                currentSpent += (getNetPrice(candidate.price, candidate.category, isForeigner) * totalPax);

                // Remove from pool to avoid duplicates
                available = available.filter(a => a.id !== candidate.id);
            } else {
                daySchedule[time] = { resting: true };
            }
        });
        days.push(daySchedule);
    }

    return days;
};
