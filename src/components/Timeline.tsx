import { motion } from 'framer-motion';
import { Sun, Sunset, Moon, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { TimeSlot } from '@/types';

interface TimelineSegmentProps {
    dayNumber: number;
    dayTitle: string;
    timeSlot: TimeSlot;
    isCompleted: boolean;
    isActive: boolean;
    onClick: () => void;
}

export function TimelineSegment({
    dayNumber,
    timeSlot,
    isCompleted,
    isActive,
    onClick,
}: TimelineSegmentProps) {
    const getPeriodIcon = () => {
        switch (timeSlot) {
            case 'morning':
                return <Sun className="w-5 h-5" />;
            case 'afternoon':
                return <Sunset className="w-5 h-5" />;
            case 'evening':
                return <Moon className="w-5 h-5" />;
        }
    };

    const getPeriodLabel = () => {
        switch (timeSlot) {
            case 'morning':
                return 'Mañana';
            case 'afternoon':
                return 'Tarde';
            case 'evening':
                return 'Noche';
        }
    };

    const getPeriodGradient = () => {
        switch (timeSlot) {
            case 'morning':
                return 'from-amber-400 to-orange-500';
            case 'afternoon':
                return 'from-orange-500 to-pink-500';
            case 'evening':
                return 'from-indigo-500 to-purple-600';
        }
    };

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "relative px-6 py-4 rounded-xl transition-all duration-300",
                isActive
                    ? `bg-gradient-to-r ${getPeriodGradient()} text-white shadow-xl`
                    : isCompleted
                        ? "bg-green-50 border-2 border-green-300 text-green-800"
                        : "bg-white border-2 border-gray-200 text-gray-600 hover:border-ocean-300"
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg",
                    isActive
                        ? "bg-white/20"
                        : isCompleted
                            ? "bg-green-200"
                            : "bg-gray-100"
                )}>
                    {isCompleted ? (
                        <Check className="w-5 h-5 text-green-700" />
                    ) : (
                        getPeriodIcon()
                    )}
                </div>
                <div className="text-left">
                    <p className={cn(
                        "text-sm font-medium",
                        isActive ? "text-white/90" : isCompleted ? "text-green-700" : "text-gray-500"
                    )}>
                        Día {dayNumber}
                    </p>
                    <p className={cn(
                        "font-semibold",
                        isActive ? "text-white" : isCompleted ? "text-green-900" : "text-gray-900"
                    )}>
                        {getPeriodLabel()}
                    </p>
                </div>
            </div>
        </motion.button>
    );
}

interface DayHeaderProps {
    dayNumber: number;
    dayTitle: string;
    location: string;
    isCurrentDay: boolean;
}

export function DayHeader({ dayNumber, dayTitle, location, isCurrentDay }: DayHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
                "relative mb-8 pb-6 border-l-4",
                isCurrentDay ? "border-ocean-500" : "border-gray-300"
            )}
        >
            <div className="pl-8">
                {/* Day Badge */}
                <div className={cn(
                    "absolute left-0 top-0 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg",
                    isCurrentDay
                        ? "bg-gradient-to-br from-ocean-500 to-ocean-600 text-white"
                        : "bg-gray-200 text-gray-600"
                )}>
                    {dayNumber}
                </div>

                {/* Day Title */}
                <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-2">
                    {dayTitle}
                </h2>
                <p className="text-gray-600 flex items-center gap-2">
                    📍 {typeof location === 'object' ? (location['es'] || location['en'] || JSON.stringify(location)) : location}
                </p>
            </div>
        </motion.div>
    );
}
