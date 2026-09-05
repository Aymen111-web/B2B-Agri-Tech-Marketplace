import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Search,
    ArrowLeft,
    ShoppingCart,
    Moon,
    Sun,
    Globe,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { ListingCard } from '@/components/shared/ListingCard';
import { CropCategory, Listing } from '@/types';

const filterChips: { key: CropCategory | 'all'; label: string }[] = [
    { key: 'all', label: '🌱 All Produce' },
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

    // Top Right Header Controls State: Dark Mode, Language Selector, Cart Items
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        return localStorage.getItem('agri_theme') === 'dark';
    });

    const [language, setLanguage] = useState<'EN' | 'AM' | 'OM'>('EN');
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    // Cart state
    const [cartItems, setCartItems] = useState<string[]>(() => {
        const saved = localStorage.getItem('agri_cart_items');
        return saved ? JSON.parse(saved) : ['listing-1', 'listing-3'];
    });

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const { filterListings } = useListings();

    useEffect(() => {
        const cat = searchParams.get('category') as CropCategory;
        if (cat) setActiveCategory(cat);
    }, [searchParams]);

    useEffect(() => {
        localStorage.setItem('agri_cart_items', JSON.stringify(cartItems));
    }, [cartItems]);

    const handleThemeToggle = () => {
        const nextMode = !isDarkMode;
        setIsDarkMode(nextMode);
        localStorage.setItem('agri_theme', nextMode ? 'dark' : 'light');
    };

    const handleCategoryChange = (cat: CropCategory | 'all') => {
        setActiveCategory(cat);
        if (cat === 'all') {
            setSearchParams({});
        } else {
            setSearchParams({ category: cat });
        }
    };

    const handleAddToCart = (listing: Listing, e: React.MouseEvent) => {
        e.stopPropagation();
        if (cartItems.includes(listing.id)) {
            setCartItems((prev) => prev.filter((id) => id !== listing.id));
            showToast(`Removed ${listing.cropName} from cart`);
        } else {
            setCartItems((prev) => [...prev, listing.id]);
            showToast(`Added ${listing.cropName} to cart!`);
        }
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const filteredListings = filterListings(activeCategory, searchQuery);

    return (
        <div className={`w-full flex flex-col min-h-full pb-10 transition-colors duration-200 ${isDarkMode ? 'bg-[#0B0F14] text-white' : 'bg-[#F8F9FA] text-[#1E2328]'
            }`}>

            {/* TOP HEADER BAR WITH BACK BUTTON, TITLE, AND RIGHT ACTION CONTROLS (CART, DARK MODE, LANGUAGE) */}
            <div className={`px-4 sm:px-6 py-3.5 border-b sticky top-14 z-30 transition-colors ${isDarkMode ? 'bg-[#121820] border-[#1E293B]' : 'bg-white border-[#E2E4E7]'
                }`}>
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">

                    {/* Left: Back & Title */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/buyer')}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${isDarkMode ? 'bg-[#1E293B] hover:bg-[#334155] text-white' : 'bg-[#F0F1F2] hover:bg-[#E2E4E7] text-[#1E2328]'
                                }`}
                        >
                            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className={`text-base sm:text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1E2328]'}`}>
                                    Produce Marketplace
                                </h1>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-extrabold">
                                    Direct Co-ops
                                </span>
                            </div>
                            <p className="text-[11px] text-[#5A6270] font-medium hidden sm:block">
                                Source verified highland crops directly from regional farming co-operatives
                            </p>
                        </div>
                    </div>

                    {/* Right Action Icons: Language Selector, Dark Mode Toggle, Cart Icon with Badge */}
                    <div className="flex items-center gap-2">

                        {/* 1. LANGUAGE SELECTOR ICON BUTTON */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                                title="Switch Language"
                                className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${isDarkMode
                                    ? 'bg-[#1E293B] border-[#334155] text-white hover:bg-[#334155]'
                                    : 'bg-[#F8F9FA] border-gray-200 text-[#1E2328] hover:bg-gray-100'
                                    }`}
                            >
                                <Globe className="w-3.5 h-3.5 text-[#1E9444]" />
                                <span>{language}</span>
                            </button>

                            {isLangMenuOpen && (
                                <div className={`absolute right-0 mt-2 w-36 rounded-2xl shadow-xl border p-1 z-50 animate-fade-in ${isDarkMode ? 'bg-[#1E293B] border-[#334155] text-white' : 'bg-white border-gray-200 text-[#1E2328]'
                                    }`}>
                                    <button
                                        type="button"
                                        onClick={() => { setLanguage('EN'); setIsLangMenuOpen(false); }}
                                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-50 hover:text-[#1E9444] transition-colors flex items-center justify-between cursor-pointer"
                                    >
                                        <span>English</span>
                                        {language === 'EN' && <span className="text-emerald-500">✓</span>}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setLanguage('AM'); setIsLangMenuOpen(false); }}
                                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-50 hover:text-[#1E9444] transition-colors flex items-center justify-between cursor-pointer"
                                    >
                                        <span>አማርኛ (Amharic)</span>
                                        {language === 'AM' && <span className="text-emerald-500">✓</span>}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setLanguage('OM'); setIsLangMenuOpen(false); }}
                                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-50 hover:text-[#1E9444] transition-colors flex items-center justify-between cursor-pointer"
                                    >
                                        <span>Afaan Oromoo</span>
                                        {language === 'OM' && <span className="text-emerald-500">✓</span>}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 2. DARK MODE TOGGLE ICON BUTTON */}
                        <button
                            type="button"
                            onClick={handleThemeToggle}
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${isDarkMode
                                ? 'bg-[#1E293B] border-[#334155] text-amber-400 hover:bg-[#334155]'
                                : 'bg-[#F8F9FA] border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-[#1E9444]'
                                }`}
                        >
                            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        {/* 3. CART ICON BUTTON WITH BADGE */}
                        <button
                            type="button"
                            onClick={() => navigate('/buyer/orders')}
                            title="View Procurement Cart & Orders"
                            className="relative w-9 h-9 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105 cursor-pointer shrink-0"
                        >
                            <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-[#E69500] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>

                    </div>
                </div>
            </div>

            {/* MAIN CONTENT CONTAINER */}
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-5 space-y-5">

                {/* SEARCH INPUT & FILTER BAR */}
                <div className="flex flex-col sm:flex-row items-center gap-3">

                    {/* Search Input */}
                    <div className="relative w-full flex-1">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-[#9BA1AA]'}`} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search crops by name, region, grade, or farmer co-op..."
                            className={`w-full pl-11 pr-4 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-all shadow-2xs focus:outline-none focus:border-[#1E9444] ${isDarkMode
                                ? 'bg-[#121820] border-[#1E293B] text-white placeholder-gray-500'
                                : 'bg-white border-[#E2E4E7] text-[#1E2328] placeholder-[#9BA1AA]'
                                }`}
                        />
                    </div>

                    {/* Quick Stats Pill */}
                    <div className={`hidden lg:flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border shrink-0 text-xs font-bold ${isDarkMode ? 'bg-[#121820] border-[#1E293B] text-emerald-400' : 'bg-white border-[#E2E4E7] text-[#1E9444]'
                        }`}>
                        <ShieldCheck className="w-4 h-4" />
                        <span>{filteredListings.length} Produce Batches Live</span>
                    </div>
                </div>

                {/* CATEGORY FILTER CHIPS (HORIZONTAL SCROLL) */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                    {filterChips.map((chip) => {
                        const isActive = activeCategory === chip.key;
                        return (
                            <button
                                key={chip.key}
                                type="button"
                                onClick={() => handleCategoryChange(chip.key)}
                                className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${isActive
                                    ? 'bg-[#1E9444] border-[#1E9444] text-white shadow-xs scale-102'
                                    : isDarkMode
                                        ? 'bg-[#121820] border-[#1E293B] text-gray-300 hover:border-[#1E9444]'
                                        : 'bg-white border-[#E2E4E7] text-[#5A6270] hover:border-[#1E9444]'
                                    }`}
                            >
                                {chip.label}
                            </button>
                        );
                    })}
                </div>

                {/* PRODUCE LISTINGS GRID — EXACT 3 COLUMNS SPECIFIED BY USER */}
                {filteredListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                        {filteredListings.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                variant="grid"
                                onAddToCart={handleAddToCart}
                                isAddedToCart={cartItems.includes(listing.id)}
                            />
                        ))}
                    </div>
                ) : (
                    /* HUMANOID EMPTY STATE */
                    <div className={`text-center py-16 rounded-3xl border p-8 space-y-4 ${isDarkMode ? 'bg-[#121820] border-[#1E293B]' : 'bg-white border-[#E2E4E7]'
                        }`}>
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#1E9444] flex items-center justify-center mx-auto text-3xl shadow-xs">
                            🌾
                        </div>
                        <div>
                            <h3 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-[#1E2328]'}`}>
                                No produce batches match your search
                            </h3>
                            <p className="text-xs text-[#5A6270] mt-1 max-w-sm mx-auto font-medium">
                                We couldn't find any listings under "{activeCategory}" matching your current query. Try clearing your search or switching categories.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveCategory('all');
                                setSearchQuery('');
                                setSearchParams({});
                            }}
                            className="px-5 py-2.5 rounded-2xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}
            </div>

            {/* FLOATING SUCCESS TOAST NOTIFICATION FOR CART ACTIONS */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 bg-[#062E15] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#1E9444] text-xs font-bold flex items-center gap-2.5 z-50 animate-bounce">
                    <CheckCircle2 className="w-4 h-4 text-[#E69500]" />
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
};
