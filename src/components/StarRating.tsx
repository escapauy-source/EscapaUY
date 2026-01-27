import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showText?: boolean;
}

export function StarRating({
    rating = 0,
    maxRating = 5,
    size = 'md',
    className,
    showText = false
}: StarRatingProps) {
    const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = (safeRating % 1) >= 0.5;
    const emptyStars = Math.max(0, maxRating - fullStars - (hasHalfStar ? 1 : 0));

    const sizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-6 h-6',
    };

    return (
        <div className={cn("flex items-center gap-1", className)}>
            <div className="flex items-center gap-0.5">
                {[...Array(fullStars)].map((_, i) => (
                    <Star
                        key={`full-${i}`}
                        className={cn(sizes[size], "fill-amber-400 text-amber-400")}
                    />
                ))}
                {hasHalfStar && (
                    <StarHalf
                        className={cn(sizes[size], "fill-amber-400 text-amber-400")}
                    />
                )}
                {[...Array(emptyStars > 0 ? emptyStars : 0)].map((_, i) => (
                    <Star
                        key={`empty-${i}`}
                        className={cn(sizes[size], "text-gray-300")}
                    />
                ))}
            </div>
            {showText && (
                <span className={cn(
                    "font-bold text-gray-900",
                    size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'
                )}>
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
