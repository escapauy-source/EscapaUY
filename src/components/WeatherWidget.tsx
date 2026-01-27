import { Sun, Cloud, CloudRain, CloudLightning, Droplets, Wind } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';

interface WeatherWidgetProps {
  compact?: boolean;
  showDetails?: boolean;
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: CloudLightning,
};

const weatherLabels = (t: any) => ({
  sunny: t('weather.conditions.sunny'),
  cloudy: t('weather.conditions.cloudy'),
  rainy: t('weather.conditions.rainy'),
  stormy: t('weather.conditions.stormy'),
});

const weatherColors = {
  sunny: 'text-amber-500',
  cloudy: 'text-gray-500',
  rainy: 'text-ocean-500',
  stormy: 'text-purple-500',
};

export function WeatherWidget({ compact = false, showDetails = false }: WeatherWidgetProps) {
  const { t } = useTranslation();
  const { weather } = useApp();
  const labels = weatherLabels(t);
  const Icon = weatherIcons[weather.condition];

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
        <Icon className={cn("w-4 h-4", weatherColors[weather.condition])} />
        <span className="text-sm font-medium text-gray-700">{weather.temp}°</span>
        {weather.rainProbability > 50 && (
          <span className="text-xs text-ocean-500 flex items-center gap-0.5">
            <Droplets className="w-3 h-3" />
            {weather.rainProbability}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-ocean-50 to-white rounded-2xl p-6 border border-ocean-100 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">Colonia del Sacramento</p>
          <p className="text-xs text-gray-400">Ahora mismo</p>
        </div>
        <div className={cn("p-3 rounded-xl", weather.condition === 'sunny' ? 'bg-amber-50' : 'bg-ocean-50')}>
          <Icon className={cn("w-8 h-8", weatherColors[weather.condition])} />
        </div>
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className="text-5xl font-playfair font-bold text-gray-900">{weather.temp}°</span>
        <span className="text-lg text-gray-500 mb-2">{labels[weather.condition]}</span>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-ocean-500" />
          <span className="text-gray-600">{t('weather.rain')}: <strong>{weather.rainProbability}%</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{weather.wind} km/h</span>
        </div>
      </div>

      {showDetails && weather.forecast.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">{t('explore.filters.time_label')}</p>
          <div className="grid grid-cols-4 gap-2">
            {weather.forecast.map((f, i) => {
              const FIcon = weatherIcons[f.condition];
              return (
                <div key={i} className="text-center p-2 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">{f.time}</p>
                  <FIcon className={cn("w-5 h-5 mx-auto my-1", weatherColors[f.condition])} />
                  <p className="text-sm font-medium">{f.temp}°</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {weather.rainProbability >= 70 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
          <CloudRain className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">{t('explore.weather_alert.title')}</p>
            <p className="text-xs text-amber-700">{t('explore.weather_alert.desc')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
