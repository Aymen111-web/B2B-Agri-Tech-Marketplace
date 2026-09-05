import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, ShieldCheck } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { ListingCard } from '@/components/shared/ListingCard';
import { CropCategory } from '@/types';

const categories: { key: CropCategory; label: string; emoji: string }[] = [
    { key: 'coffee', label: 'Coffee', emoji: '☕' },
    { key: 'grains', label: 'Grains', emoji: '🌾' },
    { key: 'spices', label: 'Spices', emoji: '🌿' },
    { key: 'oilseeds', label: 'Oilseeds', emoji: '🥜' },
    { key: 'pulses', label: 'Pulses', emoji: '🫘' },
    { key: 'roots', label: 'Roots', emoji: '🧅' },
    { key: 'fruits', label: 'Fruits', emoji: '🍋' },
    { key: 'vegetables', label: 'Vegetables', emoji: '🥬' },
];

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const { listings } = useListings();
    const featuredListings = listings.slice(0, 3);

    return (
        <div className="w-full flex flex-col space-y-6 pb-6">
            {/* Section 1 — Hero banner */}
            <div className="relative bg-gradient-to-b from-[#0D1117] to-[#0F2A18] text-white p-6 pt-7 overflow-hidden rounded-b-2xl shadow-md">
                {/* Radial green glow top-right corner */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#1E9444]/25 blur-3xl rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col items-start gap-3">
                    {/* Top green pill badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E9444]/20 border border-[#1E9444]/40 text-[#C3EFCF] text-[11px] font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#52B870]" />
                        <span>Verified farmers. Trusted supply.</span>
                    </div>

                    {/* H1 Title: no single word highlighted in a different color */}
                    <h1 className="text-[26px] font-bold text-white leading-tight tracking-tight mt-1">
                        Buy fresh Ethiopian produce direct
                    </h1>

                    {/* Subtext */}
                    <p className="text-[14px] text-white/60 max-w-[340px] leading-relaxed">
                        Source verified coffee, grains, and oilseeds directly from local Ethiopian farming cooperatives.
                    </p>

                    {/* CTAs */}
                    <div className="flex items-center gap-3 mt-2">
                        <button
                            onClick={() => navigate('/buyer/marketplace')}
                            className="px-5 py-2.5 rounded-full bg-[#1E9444] text-white font-bold text-[14px] btn-hover shadow-md hover:bg-[#0F5C2A]"
                        >
                            Browse produce
                        </button>
                        <button
                            onClick={() => navigate('/apply')}
                            className="px-4 py-2.5 rounded-full bg-white/10 text-white font-semibold text-[13px] hover:bg-white/20 transition-all border border-white/15"
                        >
                            Apply as buyer
                        </button>
                    </div>
                </div>
            </div>

            {/* Section 2 — Stats row (3 equal columns, 12px gap, 20px horizontal padding) */}
            <div className="px-5">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-[#E2E4E7] rounded-xl p-4 flex flex-col items-start shadow-xs">
                        <div className="flex items-center gap-1">
                            <span className="text-[18px] font-bold text-[#1E2328]">2,840</span>
                            <ArrowUpRight className="w-4 h-4 text-[#1E9444] stroke-[3]" />
                        </div>
                        <span className="text-[11px] font-medium text-[#5A6270] mt-1">Verified farmers</span>
                    </div>

                    <div className="bg-white border border-[#E2E4E7] rounded-xl p-4 flex flex-col items-start shadow-xs">
                        <span className="text-[18px] font-bold text-[#1E2328]">142</span>
                        <span className="text-[11px] font-medium text-[#5A6270] mt-1">Crop types listed</span>
                    </div>

                    <div className="bg-white border border-[#E2E4E7] rounded-xl p-4 flex flex-col items-start shadow-xs">
                        <span className="text-[18px] font-bold text-[#1E2328]">0% brokers</span>
                        <span className="text-[11px] font-medium text-[#5A6270] mt-1">Direct price</span>
                    </div>
                </div>
            </div>

            {/* Section 3 — Category grid (4 columns × 2 rows) */}
            <div className="px-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[16px] font-bold text-[#1E2328]">Explore categories</h3>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                    {categories.map((cat) => (
                        <div
                            key={cat.key}
                            onClick={() => navigate(`/buyer/marketplace?category=${cat.key}`)}
                            className="bg-white border border-[#E2E4E7] rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#1E9444] hover:bg-[#EDFAF2]/40 transition-all shadow-xs"
                        >
                            <span className="text-[28px] mb-1 leading-none select-none">{cat.emoji}</span>
                            <span className="text-[11px] font-semibold text-[#1E2328]">{cat.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section 4 — Featured listings */}
            <div className="px-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[16px] font-bold text-[#1E2328]">Featured listings</h3>
                    <button
                        onClick={() => navigate('/buyer/marketplace')}
                        className="text-[13px] font-bold text-[#1E9444] flex items-center gap-0.5 hover:underline"
                    >
                        <span>View all</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-col space-y-2.5">
                    {featuredListings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} variant="row" />
                    ))}
                </div>
            </div>
        </div>
    );
};
