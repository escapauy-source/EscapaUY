import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { Review } from '@/types';
import { StarRating } from './StarRating';
import { useTranslation } from 'react-i18next';

interface ReviewCardProps {
    review: Review;
    isTestimonial?: boolean;
}

export function ReviewCard({ review, isTestimonial = false }: ReviewCardProps) {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col h-full"
        >
            <div className="flex items-center gap-4 mb-4">
                <img
                    src={review.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName)}&background=random`}
                    alt={review.userName}
                    className="w-12 h-12 rounded-full border-2 border-ocean-100 object-cover"
                />
                <div>
                    <h4 className="font-bold text-gray-900">{review.userName}</h4>
                    <StarRating rating={review.rating} size="sm" />
                </div>
            </div>

            <div className="relative flex-1">
                {isTestimonial && (
                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-ocean-100 -z-0 opacity-50" />
                )}
                <p className="text-gray-600 italic relative z-10 leading-relaxed">
                    "{review.comment}"
                </p>
            </div>

            {(review.placeName || review.date) && !isTestimonial && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                    {review.placeName && (
                        <span className="font-medium text-ocean-600">
                            {t('landing.testimonials.view_place')}: {review.placeName}
                        </span>
                    )}
                    <span>{new Date(review.date).toLocaleDateString()}</span>
                </div>
            )}

            {isTestimonial && review.placeName && (
                <div className="mt-4 text-xs font-medium text-ocean-500 bg-ocean-50 px-3 py-1 rounded-full self-start">
                    {review.placeName}
                </div>
            )}
        </motion.div>
    );
}
