import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface BigFiveCardSelectorProps {
  trait: string;
  traitName: string;
  leftOption: { label: string; description: string };
  rightOption: { label: string; description: string };
  selectedValue?: number | null;
  onSelect: (value: number) => void;
}

export const BigFiveCardSelector = ({
  trait,
  traitName,
  leftOption,
  rightOption,
  selectedValue,
  onSelect,
}: BigFiveCardSelectorProps) => {
  const { t } = useTranslation();
  
  // Five options for more nuanced choices (not just black and white)
  const options = [
    { value: 0, label: leftOption.label, description: leftOption.description, align: 'left' },
    { value: 25, label: t('adn.slightly_left'), description: t('adn.slightly_left_desc'), align: 'left-center' },
    { value: 50, label: t('adn.balance'), description: t('adn.balance_desc'), align: 'center' },
    { value: 75, label: t('adn.slightly_right'), description: t('adn.slightly_right_desc'), align: 'right-center' },
    { value: 100, label: rightOption.label, description: rightOption.description, align: 'right' },
  ];

  const colors = {
    openness: 'from-purple-500 to-purple-600',
    conscientiousness: 'from-blue-500 to-blue-600',
    extraversion: 'from-orange-500 to-orange-600',
    agreeableness: 'from-green-500 to-green-600',
    neuroticism: 'from-rose-500 to-rose-600',
  };

  const gradientClass = colors[trait as keyof typeof colors] || 'from-ocean-500 to-ocean-600';

  // Get the correct fill count based on value
  const getFillCount = (value: number) => {
    if (value >= 100) return 5;
    if (value >= 75) return 4;
    if (value >= 50) return 3;
    if (value >= 25) return 2;
    return 1;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-slate-900">{traitName}</h3>
        <div className={`h-1 w-20 mx-auto bg-gradient-to-r ${gradientClass} rounded-full`}></div>
      </div>

      {/* Cards Grid - 5 options for more nuance */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {options.map((option, idx) => (
          <motion.button
            key={option.value}
            onClick={() => onSelect(option.value)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${
              selectedValue === option.value
                ? `bg-gradient-to-br ${gradientClass} text-white shadow-lg scale-105 z-10`
                : 'bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-300 hover:shadow-md'
            }`}
          >
            {/* Selection indicator */}
            {selectedValue === option.value && (
              <motion.div
                layoutId={`selection-${trait}`}
                className="absolute inset-0 bg-white/10 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}

            {/* Content */}
            <div className="relative z-10 space-y-3">
              {/* Icon/Emoji based on position */}
              <div className="text-3xl">
                {option.align === 'left' && '◀'}
                {option.align === 'left-center' && '◀─'}
                {option.align === 'center' && '⚖'}
                {option.align === 'right-center' && '─▶'}
                {option.align === 'right' && '▶'}
              </div>

              {/* Label */}
<h4 className="font-semibold text-sm text-left leading-tight">{option.label}</h4>

              {/* Description - condensed for 5 options */}
              <p
                className={`text-xs text-left leading-relaxed line-clamp-3 ${
                  selectedValue === option.value ? 'text-white/90' : 'text-slate-600'
                }`}
              >
                {option.description}
              </p>

              {/* Score indicator */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const fillCount = getFillCount(option.value);
                    const isFilled = i < fillCount;
                    return (
                      <div
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full ${
                          isFilled
                            ? selectedValue === option.value
                              ? 'bg-white'
                              : `bg-gradient-to-r ${gradientClass}`
                            : selectedValue === option.value
                            ? 'bg-white/30'
                            : 'bg-slate-300'
                        }`}
                      />
                    );
                  })}
                </div>
                <span className={`text-xs font-mono ${selectedValue === option.value ? 'text-white/80' : 'text-slate-500'}`}>
                  {option.value}
                </span>
              </div>
            </div>

            {/* Selection checkmark */}
            {selectedValue === option.value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 bg-white/20 rounded-full p-1.5 backdrop-blur-sm"
              >
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Trait range explanation with more granularity */}
      <div className="flex justify-between text-xs text-slate-500 px-1">
        <span className="font-medium text-center flex-1">{leftOption.label}</span>
        <span className="font-medium text-center flex-1 text-slate-400">—</span>
        <span className="font-medium text-center flex-1">{t('adn.balance')}</span>
        <span className="font-medium text-center flex-1 text-slate-400">—</span>
        <span className="font-medium text-center flex-1">{rightOption.label}</span>
      </div>

      {/* Selected value display */}
      {selectedValue !== null && (
        <div className="text-center">
          <span className="text-sm text-slate-600">
            {t('adn.selected_value')}: <strong className="text-slate-900">{selectedValue}</strong>
          </span>
        </div>
      )}
    </div>
  );
};
