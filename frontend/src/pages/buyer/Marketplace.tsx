import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { ListingCard } from '@/components/shared/ListingCard';
import { CropCategory } from '@/types';

const filterChips: { key: CropCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All produce' },
    { key: 'coffee', label: '☕ Coffee' },
    { key: 'grains', label: '🌾 Grains' },
    { key: 'spices', label: '🌿 Spices' },
    { key: 'oilseeds', label: '🥜 Oilseeds' },
    { key: 'pulses', label: '🫘 Pulses' },
    { key: 'roots', label: '🧅 Roots' },
    { key: 'fruits', label: '🍋 Fruits' },
    { key: 'vegetables', label: '🥬 Vegetables' },
];

export const Marketplace: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCategory = (searchParams.get('category') as CropCategory) || 'all';

    const [activeCategory, setActiveCategory] = useState<CropCategory | 'all'>(initialCategory);
    const [searchQuery, setSearchQuery] = useState('');

    const { filterListings } = useListings();

    useEffect(() => {
        const cat = searchParams.get('category') as CropCategory;
        if (cat) setActiveCategory(cat);
    }, [searchParams]);

    const handleCategoryChange = (cat: CropCategory | 'all') => {
        setActiveCategory(cat);
        if (cat === 'all') {
            setSearchParams({});
        } else {
            setSearchParams({ category: cat });
        }
    };

    const filteredListings = filterListings(activeCategory, searchQuery);

    return (
        <div className="w-full flex flex-col min-h-full pb-6">
            {/* Top Header Bar */}
            <div className="px-4 py-3 bg-white border-b border-[#E2E4E7] flex items-center gap-3 sticky top-14 z-30">
                <button
                    onClick={() => navigate('/buyer')}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F0F1F2] transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-[#1E2328]" />
                </button>
                <h2 className="text-[17px] font-bold text-[#1E2328]">Marketplace</h2>
            </div>

            <div className="p-4 space-y-4">
                {/* Search Input */}
                <div className="relative w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9BA1AA]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search crops, regions, grades…"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E4E7] rounded-full text-[14px] text-[#1E2328] placeholder-[#9BA1AA] focus:outline-none focus:border-[#1E9444] transition-colors shadow-2xs"
                    />
                </div>

                {/* Filter Chips (horizontal scroll, no scrollbar visible) */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">
                    {filterChips.map((chip) => {
                        const isActive = activeCategory === chip.key;
                        return (
                            <button
                                key={chip.key}
                                onClick={() => handleCategoryChange(chip.key)}
                                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all shrink-0 ${isActive
                                        ? 'bg-[#EDFAF2] border-[#1E9444] text-[#1E9444] shadow-2xs'
                                        : 'bg-white border-[#E2E4E7] text-[#5A6270] hover:border-[#9BA1AA]'
                                    }`}
                            >
                                {chip.label}
                            </button>
                        );
                    })}
                </div>

                {/* Listings Grid: 2 columns, 12px gap */}
                {filteredListings.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                        {filteredListings.map((listing) => (
                            <ListingCard key={listing.id} listing={listing} variant="grid" />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-[#E2E4E7] p-6 mt-4">
                        <span className="text-4xl block mb-2">🌾</span>
                        <h4 className="text-[15px] font-bold text-[#1E2328]">No produce found</h4>
                        <p className="text-[12px] text-[#5A6270] mt-1 max-w-xs mx-auto">
                            Try resetting your search query or selecting a different crop category.
                        </p>
                        <button
                            onClick={() => {
                                setActiveCategory('all');
                                setSearchQuery('');
                                setSearchParams({});
                            }}
                            className="mt-4 px-4 py-2 rounded-full bg-[#1E9444] text-white font-semibold text-[12px]"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
