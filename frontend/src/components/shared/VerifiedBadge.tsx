import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
    size?: 'sm' | 'md';
    className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ size = 'sm', className = '' }) => {
    return (
        <span
            className={`inline-flex items-center gap-1 font-semibold rounded-full px-2 py-0.5 bg-[#1E9444]/15 text-[#1E9444] ${size === 'sm' ? 'text-[11px]' : 'text-[12px]'
                } ${className}`}
        >
            <ShieldCheck className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            <span>Verified</span>
        </span>
    );
};
