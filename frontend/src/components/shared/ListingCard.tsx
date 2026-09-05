import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { Listing } from '@/types';
import { VerifiedBadge } from './VerifiedBadge';
import { GradeBadge } from './GradeBadge';
import { formatETB } from '@/lib/utils';

interface ListingCardProps {
    listing: Listing;
    variant?: 'grid' | 'row';
    className?: string;
    onAddToCart?: (listing: Listing, e: React.MouseEvent) => void;
    isAddedToCart?: boolean;
}

// Category gradient generator for visual punch
const getCategoryGradient = (category: string) => {
    switch (category) {
        case 'coffee':
            return 'from-[#3E2723] via-[#4E342E] to-[#0F5C2A]';
        case 'grains':
            return 'from-[#2E7D32] via-[#388E3C] to-[#1E9444]';
        case 'spices':
            return 'from-[#D84315] via-[#E64A19] to-[#BF360C]';
        case 'oilseeds':
            return 'from-[#F57F17] via-[#FB8C00] to-[#E65100]';
        case 'pulses':
            return 'from-[#5D4037] via-[#6D4C41] to-[#3E2723]';
        case 'roots':
            return 'from-[#6A1B9A] via-[#8E24AA] to-[#4A148C]';
        case 'fruits':
            return 'from-[#EF6C00] via-[#F57C00] to-[#E65100]';
        case 'vegetables':
            return 'from-[#1B5E20] via-[#2E7D32] to-[#1E9444]';
        default:
            return 'from-[#062E15] via-[#0F5C2A] to-[#1E9444]';
    }
};

export const ListingCard: React.FC<ListingCardProps> = ({
    listing,
    variant = 'grid',
    className = '',
    onAddToCart,
    isAddedToCart = false,
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/buyer/listing/${listing.id}`);
    };

    const handleCartClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onAddToCart) {
            onAddToCart(listing, e);
        } else {
            navigate(`/buyer/checkout/${listing.id}`);
        }
    };

    if (variant === 'row') {
        return (
            <div
                onClick={handleClick}
                className={`flex items-center gap-3 p-3 bg-white border border-[#E2E4E7] rounded-2xl hover:border-[#1E9444] hover:bg-[#F8F9FA] transition-all cursor-pointer shadow-2xs group ${className}`}
            >
                <div className="w-12 h-12 rounded-xl bg-[#F0F1F2] flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                    {listing.cropEmoji}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <h4 className="text-[14px] font-bold text-[#1E2328] truncate">{listing.cropName}</h4>
                        {listing.isVerified && <VerifiedBadge size="sm" />}
                    </div>
                    <p className="text-[12px] text-[#5A6270] truncate font-medium">
                        {listing.farmer.name} · <span className="text-[#1E9444] font-semibold">{listing.region} Co-op</span>
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                        <span className="text-[15px] font-black text-[#1E9444] block">
                            {formatETB(listing.pricePerKg)}
                        </span>
                        <span className="text-[11px] text-[#5A6270] font-medium">/ kg</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleCartClick}
                        title="Add to Cart"
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shadow-2xs cursor-pointer ${isAddedToCart
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 hover:bg-[#1E9444] text-[#1E9444] hover:text-white border border-emerald-200'
                            }`}
                    >
                        {isAddedToCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        );
    }

    // 3-Column / Grid variant (Polished Humanoid Aesthetic)
    return (
        <div
            onClick={handleClick}
            className={`bg-white border border-[#E2E4E7] rounded-3xl overflow-hidden hover:border-[#1E9444] transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex flex-col group ${className}`}
        >
            {/* 135px Hero Image Area */}
            <div
                className={`h-[135px] bg-gradient-to-br ${getCategoryGradient(
                    listing.category
                )} relative flex items-center justify-center overflow-hidden`}
            >
                {/* Decorative ambient lighting overlay */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

                <span className="text-6xl drop-shadow-lg select-none group-hover:scale-110 transition-transform duration-200 relative z-10">
                    {listing.cropEmoji}
                </span>

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 z-20">
                    {listing.isVerified && <VerifiedBadge size="sm" />}
                </div>
                <div className="absolute top-2.5 right-2.5 z-20">
                    <GradeBadge grade={listing.grade} />
                </div>
            </div>

            {/* Content Details */}
            <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                    <h3 className="text-[15px] font-black text-[#1E2328] leading-tight line-clamp-1 group-hover:text-[#1E9444] transition-colors">
                        {listing.cropName}
                    </h3>
                    <p className="text-[12px] text-[#5A6270] mt-1 font-medium truncate flex items-center gap-1">
                        <span className="text-gray-800 font-bold">{listing.farmer.name}</span>
                        <span>·</span>
                        <span className="text-[#1E9444] font-semibold">{listing.region} Union</span>
                    </p>
                </div>

                {/* Price, Stock & Quick Cart Icon Action */}
                <div className="flex items-center justify-between pt-3 border-t border-[#F0F1F2]">
                    <div>
                        <span className="text-[16px] font-black text-[#1E9444] block leading-none">
                            {formatETB(listing.pricePerKg)}
                        </span>
                        <span className="text-[10px] text-[#5A6270] font-bold">
                            {listing.availableQty >= 1000
                                ? `${(listing.availableQty / 1000).toFixed(1)} tons available`
                                : `${listing.availableQty} kg available`}
                        </span>
                    </div>

                    {/* CART ICON BUTTON ON LISTING ITEM */}
                    <button
                        type="button"
                        onClick={handleCartClick}
                        title="Add produce batch to cart"
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-2xs ${isAddedToCart
                            ? 'bg-emerald-700 text-white scale-105'
                            : 'bg-[#EDFAF2] hover:bg-[#1E9444] text-[#1E9444] hover:text-white border border-[#C3EFCF] hover:shadow-xs'
                            }`}
                    >
                        {isAddedToCart ? (
                            <Check className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                            <ShoppingCart className="w-4 h-4 stroke-[2]" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
