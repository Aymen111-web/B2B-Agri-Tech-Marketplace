import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Heart, Minus, Plus, ShieldCheck } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { EscrowBanner } from '@/components/shared/EscrowBanner';
import { formatETB, formatDate } from '@/lib/utils';

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

export const ListingDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getListingById } = useListings();

    const listing = getListingById(id || '');

    const [quantity, setQuantity] = useState<number>(listing ? listing.minOrderQty : 500);
    const [isSaved, setIsSaved] = useState(false);

    if (!listing) {
        return (
            <div className="p-8 text-center">
                <h3 className="text-lg font-bold">Listing not found</h3>
                <button
                    onClick={() => navigate('/buyer/marketplace')}
                    className="mt-4 px-4 py-2 bg-[#1E9444] text-white rounded-full text-sm font-semibold"
                >
                    Back to Marketplace
                </button>
            </div>
        );
    }

    const handleIncrement = () => {
        setQuantity((prev) => Math.min(prev + 100, listing.availableQty));
    };

    const handleDecrement = () => {
        setQuantity((prev) => Math.max(prev - 100, listing.minOrderQty));
    };

    const totalAmount = quantity * listing.pricePerKg;

    const handleOrder = () => {
        navigate(`/buyer/checkout/${listing.id}?qty=${quantity}`);
    };

    return (
        <div className="w-full flex flex-col bg-white min-h-screen relative pb-10">
            {/* Image Hero Area (200px tall) */}
            <div
                className={`h-[200px] bg-gradient-to-br ${getCategoryGradient(
                    listing.category
                )} relative flex items-center justify-center`}
            >
                {/* Floating Back Button (white circle, top-left) */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white text-[#1E2328] flex items-center justify-center shadow-md hover:bg-[#F8F9FA] transition-transform active:scale-95 z-20"
                >
                    <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                </button>

                {/* Centered crop emoji (90px) */}
                <span className="text-[90px] drop-shadow-lg select-none leading-none">
                    {listing.cropEmoji}
                </span>

                {/* Bottom-right corner: "Admin verified" green pill badge */}
                <div className="absolute bottom-3 right-3 bg-[#1E9444] text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin verified</span>
                </div>
            </div>

            {/* Details Body */}
            <div className="p-5 space-y-5">
                {/* Crop Name */}
                <div>
                    <h1 className="text-[22px] font-extrabold text-[#1E2328] leading-tight">
                        {listing.cropName}
                    </h1>

                    {/* Farmer Row */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0F1F2]">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-full bg-[#C3EFCF] text-[#0F5C2A] flex items-center justify-center font-extrabold text-[14px]">
                                {listing.farmer.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                            </div>
                            <div>
                                <h4 className="text-[13px] font-bold text-[#1E2328] leading-tight">
                                    {listing.farmer.name}
                                </h4>
                                <p className="text-[11px] text-[#5A6270]">{listing.region} · Cooperative</p>
                            </div>
                        </div>

                        {/* Star Rating Badge */}
                        <div className="flex items-center gap-1 bg-[#FFF8EC] text-[#D88C0A] px-2.5 py-1 rounded-full border border-[#FFE5A5] text-[12px] font-bold">
                            <Star className="w-3.5 h-3.5 fill-[#F5B73A] text-[#F5B73A]" />
                            <span>{listing.farmer.rating.toFixed(1)}</span>
                            <span className="text-[#9BA1AA] font-normal text-[11px]">
                                ({listing.farmer.reviewCount})
                            </span>
                        </div>
                    </div>
                </div>

                {/* Spec Grid (2 columns) */}
                <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-[#F8F9FA] rounded-xl p-3 border border-[#E2E4E7]/60">
                        <span className="text-[11px] text-[#5A6270] font-medium block">Grade</span>
                        <span className="text-[15px] font-bold text-[#1E2328] mt-0.5 block">
                            {listing.grade}
                        </span>
                    </div>

                    <div className="bg-[#F8F9FA] rounded-xl p-3 border border-[#E2E4E7]/60">
                        <span className="text-[11px] text-[#5A6270] font-medium block">Process</span>
                        <span className="text-[15px] font-bold text-[#1E2328] mt-0.5 block">
                            {listing.process || 'Natural'}
                        </span>
                    </div>

                    <div className="bg-[#F8F9FA] rounded-xl p-3 border border-[#E2E4E7]/60">
                        <span className="text-[11px] text-[#5A6270] font-medium block">Available Qty</span>
                        <span className="text-[15px] font-bold text-[#1E2328] mt-0.5 block">
                            {listing.availableQty.toLocaleString()} kg
                        </span>
                    </div>

                    <div className="bg-[#F8F9FA] rounded-xl p-3 border border-[#E2E4E7]/60">
                        <span className="text-[11px] text-[#5A6270] font-medium block">Min. Order</span>
                        <span className="text-[15px] font-bold text-[#1E2328] mt-0.5 block">
                            {listing.minOrderQty.toLocaleString()} kg
                        </span>
                    </div>

                    <div className="bg-[#F8F9FA] rounded-xl p-3 border border-[#E2E4E7]/60">
                        <span className="text-[11px] text-[#5A6270] font-medium block">Harvest Date</span>
                        <span className="text-[15px] font-bold text-[#1E2328] mt-0.5 block">
                            {formatDate(listing.harvestDate)}
                        </span>
                    </div>

                    <div className="bg-[#F8F9FA] rounded-xl p-3 border border-[#E2E4E7]/60">
                        <span className="text-[11px] text-[#5A6270] font-medium block">Moisture %</span>
                        <span className="text-[15px] font-bold text-[#1E2328] mt-0.5 block">
                            {listing.moistureContent ? `${listing.moistureContent}%` : '11.0%'}
                        </span>
                    </div>
                </div>

                {/* Price Box */}
                <div className="bg-[#F8F9FA] border border-[#E2E4E7] rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-[22px] font-extrabold text-[#1E9444]">
                                {formatETB(listing.pricePerKg)}
                            </span>
                            <span className="text-[13px] text-[#5A6270] font-medium">/ kg</span>
                        </div>
                        <p className="text-[11px] text-[#5A6270] mt-0.5">
                            Direct farm price · <span className="text-[#1E9444] font-semibold">-12% vs. local broker</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-[11px] text-[#5A6270] block">In Stock</span>
                        <span className="text-[13px] font-bold text-[#1E2328]">
                            {(listing.availableQty / 1000).toFixed(1)} metric tons
                        </span>
                    </div>
                </div>

                {/* Quantity Selector */}
                <div className="bg-[#F0F1F2] rounded-xl p-3 flex items-center justify-between">
                    <div>
                        <span className="text-[12px] font-bold text-[#1E2328] block">Select Quantity (kg)</span>
                        <span className="text-[11px] text-[#5A6270]">
                            Total: <strong className="text-[#1E9444]">{formatETB(totalAmount)}</strong>
                        </span>
                    </div>

                    <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-[#E2E4E7] shadow-2xs">
                        <button
                            onClick={handleDecrement}
                            disabled={quantity <= listing.minOrderQty}
                            className="w-7 h-7 rounded-full border border-[#E2E4E7] flex items-center justify-center text-[#1E2328] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F8F9FA]"
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[15px] font-bold text-[#1E2328] min-w-[50px] text-center">
                            {quantity.toLocaleString()}
                        </span>
                        <button
                            onClick={handleIncrement}
                            disabled={quantity >= listing.availableQty}
                            className="w-7 h-7 rounded-full border border-[#E2E4E7] flex items-center justify-center text-[#1E2328] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F8F9FA]"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* EscrowBanner component */}
                <EscrowBanner />

                {/* Action Row */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        onClick={() => setIsSaved(!isSaved)}
                        className={`px-5 py-3 rounded-full border border-[#1E9444] font-bold text-[14px] flex items-center gap-1.5 transition-colors ${isSaved
                            ? 'bg-[#EDFAF2] text-[#1E9444]'
                            : 'bg-white text-[#1E9444] hover:bg-[#EDFAF2]/50'
                            }`}
                    >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#1E9444]' : ''}`} />
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                        onClick={handleOrder}
                        className="flex-2 py-3 rounded-full bg-[#1E9444] text-white font-bold text-[14px] btn-hover shadow-md text-center hover:bg-[#0F5C2A]"
                    >
                        Place escrow order ({formatETB(totalAmount)})
                    </button>
                </div>
            </div>
        </div>
    );
};
