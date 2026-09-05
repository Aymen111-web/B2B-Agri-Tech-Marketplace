import React from 'react';
import { CropGrade } from '@/types';

interface GradeBadgeProps {
    grade: CropGrade;
    className?: string;
}

export const GradeBadge: React.FC<GradeBadgeProps> = ({ grade, className = '' }) => {
    return (
        <span
            className={`inline-flex items-center font-semibold text-[11px] rounded-full px-2 py-0.5 bg-[#FFF8EC] text-[#D88C0A] border border-[#FFE5A5] ${className}`}
        >
            {grade}
        </span>
    );
};
