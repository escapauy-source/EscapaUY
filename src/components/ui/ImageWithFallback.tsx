import { useState } from 'react';
import { cn } from '@/utils/cn';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
}

export function ImageWithFallback({
    src,
    alt,
    className,
    fallbackSrc = '/assets/placeholder-luxury.jpg',
    ...props
}: ImageWithFallbackProps) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(fallbackSrc);
        }
    };

    return (
        <img
            src={imgSrc}
            alt={alt}
            loading="lazy"
            onError={handleError}
            className={cn("object-cover w-full h-full", className)}
            {...props}
        />
    );
}
