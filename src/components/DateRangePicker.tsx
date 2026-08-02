import { motion } from 'framer-motion';
import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DateRangePickerProps {
    startDate: Date | null;
    endDate: Date | null;
    onDateChange: (start: Date | null, end: Date | null) => void;
    minNights?: number;
    maxNights?: number;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
    startDate,
    endDate,
    onDateChange,
    minNights = 1,
    maxNights = 7,
}) => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectingStart, setSelectingStart] = useState(true);

    const daysInMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
    ).getDay();

    const monthNames = [
        t('weather.months.0', 'Enero'), t('weather.months.1', 'Febrero'), t('weather.months.2', 'Marzo'),
        t('weather.months.3', 'Abril'), t('weather.months.4', 'Mayo'), t('weather.months.5', 'Junio'),
        t('weather.months.6', 'Julio'), t('weather.months.7', 'Agosto'), t('weather.months.8', 'Septiembre'),
        t('weather.months.9', 'Octubre'), t('weather.months.10', 'Noviembre'), t('weather.months.11', 'Diciembre')
    ];

    const dayNames = [
        t('weather.days.0', 'Dom'), t('weather.days.1', 'Lun'), t('weather.days.2', 'Mar'),
        t('weather.days.3', 'Mié'), t('weather.days.4', 'Jue'), t('weather.days.5', 'Vie'),
        t('weather.days.6', 'Sáb')
    ];

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleDateClick = (day: number) => {
        const selectedDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );

        if (selectingStart) {
            onDateChange(selectedDate, null);
            setSelectingStart(false);
        } else {
            if (selectedDate.toDateString() === startDate!.toDateString()) {
                // Clicking the same date as start: restart selection
                onDateChange(selectedDate, null);
                setSelectingStart(false);
                return;
            }

            if (selectedDate < startDate!) {
                // If end date is before start, swap them
                onDateChange(selectedDate, startDate);
                setIsOpen(false);
                setSelectingStart(true);
            } else {
                const nights = Math.ceil(
                    (selectedDate.getTime() - startDate!.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (nights >= minNights && nights <= maxNights) {
                    onDateChange(startDate, selectedDate);
                    setIsOpen(false);
                    setSelectingStart(true);
                } else {
                    // Feedback: maybe flash red or just restart?
                    // For now, let's just make it the new start date if it's too far
                    onDateChange(selectedDate, null);
                    setSelectingStart(false);
                }
            }
        }
    };

    const isDateInRange = (day: number): boolean => {
        if (!startDate || !endDate) return false;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return date >= startDate && date <= endDate;
    };

    const isStartDate = (day: number): boolean => {
        if (!startDate) return false;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return date.toDateString() === startDate.toDateString();
    };

    const isEndDate = (day: number): boolean => {
        if (!endDate) return false;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return date.toDateString() === endDate.toDateString();
    };

    const isDisabled = (day: number): boolean => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const formatDateRange = (): string => {
        if (!startDate) return t('itinerary.date_picker.placeholder');

        const locale = i18n.language === 'en' ? 'en-US' : 'es-UY';
        if (!endDate) return `${startDate.toLocaleDateString(locale)} - ...`;

        const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const suffix = nights === 1 ? t('itinerary.date_picker.nights_suffix') : t('itinerary.date_picker.nights_suffix_plural', { count: nights });

        return `${startDate.toLocaleDateString(locale)} - ${endDate.toLocaleDateString(locale)} (${suffix})`;
    };

    const renderCalendar = () => {
        const days = [];
        const totalSlots = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

        for (let i = 0; i < totalSlots; i++) {
            if (i < firstDayOfMonth || i >= firstDayOfMonth + daysInMonth) {
                days.push(<div key={i} className="h-10" />);
            } else {
                const day = i - firstDayOfMonth + 1;
                const disabled = isDisabled(day);
                const inRange = isDateInRange(day);
                const isStart = isStartDate(day);
                const isEnd = isEndDate(day);

                days.push(
                    <button
                        key={i}
                        onClick={() => !disabled && handleDateClick(day)}
                        disabled={disabled}
                        className={`
              h-10 rounded-lg transition-all
              ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-white hover:bg-white/10'}
              ${inRange ? 'bg-[#C5A059]/20' : ''}
              ${isStart || isEnd ? 'bg-[#C5A059] font-bold ring-2 ring-[#C5A059]/50' : ''}
            `}
                    >
                        {day}
                    </button>
                );
            }
        }
        return days;
    };

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-[#1A1F2C]/80 to-[#2A3142]/80 backdrop-blur-md border border-white/10 hover:border-[#C5A059]/50 transition-all group"
            >
                <Calendar className="w-5 h-5 text-[#C5A059] group-hover:scale-110 transition-transform" />
                <div className="text-left">
                    <div className="text-xs text-gray-400 uppercase tracking-wider">{t('itinerary.date_picker.label')}</div>
                    <div className="text-sm font-medium text-white">{formatDateRange()}</div>
                </div>
                {startDate && endDate && (
                    <Check className="w-5 h-5 text-[#4CAF50] ml-2" />
                )}
            </button>

            {/* Calendar Dropdown */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 z-50 p-6 rounded-2xl bg-gradient-to-br from-[#1A1F2C] to-[#2A3142] backdrop-blur-xl border border-white/20 shadow-2xl min-w-[340px]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <div className="text-lg font-bold text-white">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </div>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {dayNames.map((name) => (
                            <div key={name} className="text-center text-xs text-gray-400 font-medium">
                                {name}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {renderCalendar()}
                    </div>

                    {/* Instructions */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-400 text-center">
                            {selectingStart ? (
                                t('itinerary.date_picker.select_arrival')
                            ) : (
                                t('itinerary.date_picker.select_departure', { min: minNights, max: maxNights })
                            )}
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
