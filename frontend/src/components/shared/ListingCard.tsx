import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Listing } from '@/types';
import { VerifiedBadge } from './VerifiedBadge';
import { GradeBadge } from './GradeBadge';
import { formatETB } from '@/lib/utils';

interface ListingCardProps {
    listing: Listing;
    variant?: 'grid' | 'row';
    className?: string;
}

// Category gradient generator for visual punch
const getCategoryGradient = (category: string) => {
    switch (category) {
        case 'coffee':
            return 'from-[#3E2723] to-[#5D4037]';
        case 'grains':
            return 'from-[#7CB342] to-[#558B2F]';
        case 'spices':
            return 'from-[#D84315] to-[#BF360C]';
        case 'oilseeds':
            return 'from-[#F57F17] to-[#E65100]';
        case 'pulses':
            return 'from-[#8D6E63] to-[#4E342E]';
        case 'roots':
            return 'from-[#8E24AA] to-[#4A148C]';
        case 'fruits':
            return 'from-[#FB8C00] to-[#EF6C00]';
        case 'vegetables':
            return 'from-[#43A047] to-[#2E7D32]';
        default:
            return 'from-[#1E9444] to-[#0F5C2A]';
    }
};

export const ListingCard: React.FC<ListingCardProps> = ({
    listing,
    variant = 'grid',
    className = '',
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/buyer/listing/${listing.id}`);
    };

    if (variant === 'row') {
        return (
            <div
                onClick={handleClick}
                className={`flex items-center gap-3 p-3 bg-white border border-[#E2E4E7] rounded-xl hover:bg-[#F8F9FA] transition-colors cursor-pointer ${className}`}
            >
                <div className="w-12 h-12 rounded-lg bg-[#F0F1F2] flex items-center justify-center text-2xl shrink-0">
                    {listing.cropEmoji}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <h4 className="text-[14px] font-bold text-[#1E2328] truncate">{listing.cropName}</h4>
                        {listing.isVerified && <VerifiedBadge size="sm" />}
                    </div>
                    <p className="text-[12px] text-[#5A6270] truncate">
                        {listing.region} · {listing.availableQty.toLocaleString()} kg available
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <span className="text-[15px] font-bold text-[#1E9444] block">
                        {formatETB(listing.pricePerKg)}
                    </span>
                    <span className="text-[11px] text-[#9BA1AA]">/ kg</span>
                </div>
            </div>
        );
    }

    // Grid variant
    return (
        <div
            onClick={handleClick}
            className={`bg-white border border-[#E2E4E7] rounded-2xl overflow-hidden hover:border-[#1E9444] transition-all duration-150 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex flex-col ${className}`}
        >
            {/* 140px Hero Image area */}
            <div
                className={`h-[140px] bg-gradient-to-br ${getCategoryGradient(
                    listing.category
                )} relative flex items-center justify-center`}
            >
                <span className="text-6xl drop-shadow-md select-none">{listing.cropEmoji}</span>

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5">
                    {listing.isVerified && <VerifiedBadge size="sm" />}
                </div>
                <div className="absolute top-2.5 right-2.5">
                    <GradeBadge grade={listing.grade} />
                </div>
            </div>

            {/* Details */}
            <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                <div>
                    <h3 className="text-[15px] font-bold text-[#1E2328] leading-tight line-clamp-1">
                        {listing.cropName}
                    </h3>
                    <p className="text-[12px] text-[#5A6270] mt-0.5 truncate">
                        {listing.farmer.name} · <span className="text-[#9BA1AA]">{listing.region}</span>
                    </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#F0F1F2]">
                    <div>
                        <span className="text-[16px] font-extrabold text-[#1E9444]">
                            {formatETB(listing.pricePerKg)}
                        </span>
                        <span className="text-[11px] text-[#5A6270]">/kg</span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDFAF2] text-[#0F5C2A]">
                        {listing.availableQty >= 1000
                            ? `${(listing.availableQty / 1000).toFixed(1)}t`
                            : `${listing.availableQty}kg`}
                    </span>
                </div>
            </div>
        </div>
    );
};
