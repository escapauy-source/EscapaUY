/**
 * Weather Service - OpenWeather API Integration
 * Provides weather data and Plan B suggestions for activities
 */

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Coordinates for popular destinations
const DESTINATION_COORDS: Record<string, { lat: number; lon: number }> = {
  'colonia': { lat: -34.4622, lon: -57.8384 },
  'montevideo': { lat: -34.9011, lon: -56.1645 },
  'punta del este': { lat: -34.9656, lon: -54.9546 },
  'cabo polonio': { lat: -34.4467, lon: -53.7600 },
  'piriapolis': { lat: -34.8647, lon: -54.3847 },
  'la barra': { lat: -34.9072, lon: -54.5236 },
  'josé ignacio': { lat: -34.9464, lon: -54.7125 },
  'santa teresa': { lat: -34.9653, lon: -54.5258 },
  'fortaleza de santa teresa': { lat: -34.9653, lon: -54.5258 },
  'rueda': { lat: -34.4617, lon: -57.8389 },
};

export interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  main: string;
  wind_speed: number;
  rain_probability: number;
}

export interface WeatherForecast {
  date: string;
  weather: WeatherData;
  is_rainy: boolean;
  is_sunny: boolean;
  is_cloudy: boolean;
  recommendation: string;
}

export interface PlanBActivity {
  id: string;
  name: string;
  category: string;
  location: string;
  description: string;
  indoor: boolean;
  weather_trigger: 'rain' | 'extreme_heat' | 'wind' | 'any';
}

// Indoor activities for Plan B
const INDOOR_ACTIVITIES: PlanBActivity[] = [
  {
    id: 'museum_colonia',
    name: 'Museo del Vino',
    category: 'culture',
    location: 'Colonia del Sacramento',
    description: 'Historia del vino Uruguayo con degustación',
    indoor: true,
    weather_trigger: 'rain'
  },
  {
    id: 'yacht_tour',
    name: 'Paseo en Yate Premium',
    category: 'adventure',
    location: 'Puerto de Colonia',
    description: 'Crucero panoramic por el Río de la Plata',
    indoor: false,
    weather_trigger: 'any'
  },
  {
    id: 'wine_cellar',
    name: 'Bodega Gastronómica',
    category: 'gastronomy',
    location: 'Bodegas de la región',
    description: 'Experiencia enológica con maridaje',
    indoor: true,
    weather_trigger: 'rain'
  },
  {
    id: 'spa_day',
    name: 'Day Spa & Wellness',
    category: 'wellness',
    location: 'Colonia Spa Resort',
    description: 'Masajes, sauna y tratamientos relax',
    indoor: true,
    weather_trigger: 'any'
  },
  {
    id: 'cooking_class',
    name: 'Clase de Cocina Uruguaya',
    category: 'gastronomy',
    location: 'Centro Gastronómico',
    description: 'Aprende a preparar asado y pastas caseras',
    indoor: true,
    weather_trigger: 'rain'
  },
  {
    id: 'art_gallery',
    name: 'Galería de Arte Colonial',
    category: 'culture',
    location: 'Barrio Histórico',
    description: 'Arte contemporáneo en edificio patrimonial',
    indoor: true,
    weather_trigger: 'rain'
  },
  {
    id: 'horse_racing',
    name: 'Hipódromo de Colonia',
    category: 'entertainment',
    location: 'Hipódromo Central',
    description: 'Carreras de caballos con ambiente premium',
    indoor: false,
    weather_trigger: 'any'
  },
  {
    id: 'sunset_yacht',
    name: 'Yate al Atardecer',
    category: 'romantic',
    location: 'Puerto de Colonia',
    description: 'Experiencia romántica con cócteles premium',
    indoor: false,
    weather_trigger: 'any'
  }
];

export async function getCurrentWeather(city: string = 'colonia'): Promise<WeatherData | null> {
  if (!OPENWEATHER_API_KEY) {
    console.warn('[WEATHER] API key not configured');
    return null;
  }

  const coords = DESTINATION_COORDS[city.toLowerCase()] || DESTINATION_COORDS['colonia'];

  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`
    );

    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0]?.description || 'Sin datos',
      icon: data.weather[0]?.icon || '01d',
      main: data.weather[0]?.main || 'Clear',
      wind_speed: data.wind?.speed || 0,
      rain_probability: data.rain?.['1h'] || 0
    };
  } catch (error) {
    console.error('[WEATHER] Error fetching weather:', error);
    return null;
  }
}

export async function getForecast(city: string = 'colonia', days: number = 5): Promise<WeatherForecast[]> {
  if (!OPENWEATHER_API_KEY) {
    console.warn('[WEATHER] API key not configured');
    return [];
  }

  const coords = DESTINATION_COORDS[city.toLowerCase()] || DESTINATION_COORDS['colonia'];

  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`
    );

    if (!response.ok) {
      throw new Error('Forecast API request failed');
    }

    const data = await response.json();
    
    // Process forecast data (API returns data every 3 hours)
    const dailyForecasts: WeatherForecast[] = [];
    const processedDates = new Set<string>();

    for (const item of data.list) {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      if (processedDates.has(date)) continue;
      if (dailyForecasts.length >= days) break;

      processedDates.add(date);

      const weatherMain = item.weather[0]?.main?.toLowerCase() || '';
      const isRainy = weatherMain.includes('rain') || weatherMain.includes('drizzle') || weatherMain.includes('thunderstorm');
      const isCloudy = weatherMain.includes('clouds') || weatherMain.includes('mist') || weatherMain.includes('fog');
      const isSunny = weatherMain.includes('clear');

      let recommendation = '';
      if (isRainy) {
        recommendation = '☔ Plan B recomendado: Actividades bajo techo';
      } else if (isSunny) {
        recommendation = '☀️ Ideal para actividades al aire libre';
      } else {
        recommendation = '🌤️ Conditions variables - ten un plan de respaldo';
      }

      dailyForecasts.push({
        date,
        weather: {
          temp: Math.round(item.main.temp),
          feels_like: Math.round(item.main.feels_like),
          humidity: item.main.humidity,
          description: item.weather[0]?.description || 'Sin datos',
          icon: item.weather[0]?.icon || '01d',
          main: item.weather[0]?.main || 'Clear',
          wind_speed: item.wind?.speed || 0,
          rain_probability: item.rain?.['3h'] || 0
        },
        is_rainy: isRainy,
        is_sunny: isSunny,
        is_cloudy: isCloudy,
        recommendation
      });
    }

    return dailyForecasts;
  } catch (error) {
    console.error('[WEATHER] Error fetching forecast:', error);
    return [];
  }
}

export function getPlanBSuggestions(
  trigger: 'rain' | 'extreme_heat' | 'wind' | 'any',
  activityCategory?: string
): PlanBActivity[] {
  let suggestions = INDOOR_ACTIVITIES;

  if (trigger !== 'any' && activityCategory) {
    // Filter activities based on trigger and category match
    suggestions = INDOOR_ACTIVITIES.filter(activity => {
      const matchesTrigger = activity.weather_trigger === trigger || activity.weather_trigger === 'any';
      const matchesCategory = !activityCategory || activity.category === activityCategory;
      return matchesTrigger && matchesCategory;
    });
  }

  // Shuffle and return top 3 suggestions
  return suggestions
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
}

export function checkWeatherAlert(weather: WeatherData): string | null {
  const alerts: string[] = [];

  if (weather.temp < 10) {
    alerts.push('❄️ Temperatura baja - lleva abrigo');
  } else if (weather.temp > 30) {
    alerts.push('🔥 Temperatura alta - hidratación necesaria');
  }

  if (weather.main.toLowerCase().includes('rain') || weather.main.toLowerCase().includes('thunderstorm')) {
    alerts.push('🌧️ Lluvia esperada - Plan B recomendado');
  }

  if (weather.wind_speed > 15) {
    alerts.push('💨 Viento fuerte - actividades al aire libre pueden verse afectadas');
  }

  if (weather.humidity > 85) {
    alerts.push('💧 Alta humedad - sensaciones térmicas extremas');
  }

  return alerts.length > 0 ? alerts.join('\n') : null;
}

export function getWeatherEmoji(weather: WeatherData): string {
  const main = weather.main.toLowerCase();
  
  if (main.includes('clear')) {
    return '☀️';
  } else if (main.includes('clouds')) {
    return '☁️';
  } else if (main.includes('rain') || main.includes('drizzle')) {
    return '🌧️';
  } else if (main.includes('thunderstorm')) {
    return '⛈️';
  } else if (main.includes('snow')) {
    return '❄️';
  } else if (main.includes('mist') || main.includes('fog')) {
    return '🌫️';
  } else if (main.includes('extreme') || main.includes('hurricane')) {
    return '🌀';
  }
  
  return '🌡️';
}

export function formatWeatherForDisplay(weather: WeatherData): string {
  const emoji = getWeatherEmoji(weather);
  return `${emoji} ${weather.temp}°C - ${weather.description}`;
}
