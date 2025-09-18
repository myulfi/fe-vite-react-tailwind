import { useEffect, useRef } from 'react';

interface CircularProgressProps {
    progress: number;
    min?: number;
    max?: number;
}

export default function CircularProgress({ progress, min = 0, max = 100 }: CircularProgressProps) {
    const circleRef = useRef<SVGCircleElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    const radius = 54;
    const circumference = 2 * Math.PI * radius;

    const clampedProgress = Math.min(Math.max(progress, min), max);
    const percent = Math.round(((clampedProgress - min) / (max - min)) * 100);

    useEffect(() => {
        const circle = circleRef.current;
        const text = textRef.current;

        if (!circle || !text) return;

        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDasharray = `${circumference}`;
        circle.style.strokeDashoffset = `${offset}`;
        text.textContent = `${percent}%`;
    }, [percent, circumference]);

    return (
        <div className="relative w-40 h-40">
            <svg className="-rotate-90 w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="text-light-outline dark:text-dark-outline"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    r="54"
                    cx="60"
                    cy="60"
                />
                <circle
                    ref={circleRef}
                    className="text-light-base dark:text-dark-base transition-all duration-100 ease-linear"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    r="54"
                    cx="60"
                    cy="60"
                    strokeDasharray="339.292"
                    strokeDashoffset="339.292"
                />
            </svg>
            <div
                ref={textRef}
                className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-light-base-line dark:text-dark-base-line"
            >
                0%
            </div>
        </div>
    );
}
