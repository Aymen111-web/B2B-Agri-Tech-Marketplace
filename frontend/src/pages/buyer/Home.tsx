import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart,
    Truck,
    ChevronRight,
    Zap,
    Building2,
    UserCheck,
    Users,
    PackageCheck,
    ShieldCheck,
    Sparkles,
    Store,
    ArrowUpRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useOrders } from '@/hooks/useOrders';
import { Buyer, CropCategory } from '@/types';
import { formatETB } from '@/lib/utils';
import { api } from '@/services/api';

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
    const { user } = useAuth();
    const buyer = user as Buyer;
    const { listings } = useListings();
    const { orders } = useOrders();

    // Stats state loaded from backend API with fallback
    const [stats, setStats] = useState<{
        active_orders: number;
        total_procurement_etb: number;
        regional_hubs_count: number;
        primary_unions_count: number;
        verified_farmers_count: number;
        pending_handoffs_count: number;
        active_contracts_count: number;
        cart_items_count: number;
    }>({
        active_orders: 3,
        total_procurement_etb: 340000,
        regional_hubs_count: 30,
        primary_unions_count: 12,
        verified_farmers_count: 2840,
        pending_handoffs_count: 1,
        active_contracts_count: 5,
        cart_items_count: 0,
    });

    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        api.fetchBuyerDashboardStats()
            .then((res) => {
                if (res && res.stats) {
                    setStats(res.stats);
                }
            })
            .catch(() => {
                // Keep default state on offline/network errors
            });
    }, []);

    // Filter listings based on category selection
    const filteredListings = selectedCategory === 'all'
        ? listings.slice(0, 4)
        : listings.filter((l) => l.category === selectedCategory).slice(0, 4);

    const activeOrdersList = orders.filter((o) => o.status === 'in_transit' || o.status === 'dispatched' || o.status === 'placed');
    const latestTransitOrder = activeOrdersList.length > 0 ? activeOrdersList[0] : null;

    return (
        <div className="w-full flex flex-col min-h-full pb-8 max-w-5xl mx-auto space-y-5">

            {/* WELCOME BANNER (STYLED WITH LOGO BRAND COLORS: ROYAL BLUE #0B57D0, GOLDEN YELLOW #E69500 & EMERALD GREEN #1E9444) */}
            <div className="bg-gradient-to-r from-[#062E15] via-[#0F5C2A] to-[#0B57D0] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
                {/* Decorative Ambient Color Glow Spheres */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E69500]/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#0B57D0]/30 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                Welcome back, {buyer?.companyName || buyer?.name || 'Addis Supply Co.'}
                            </h2>
                            <ShieldCheck className="w-5 h-5 text-[#E69500]" />
                        </div>
                        <p className="text-xs text-[#C3EFCF] mt-1 font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#E69500] animate-pulse" />
                            <span>Commercial Procurement Hub · Verified Trade Buyer</span>
                        </p>
                    </div>

                    {/* Total Procured Summary Box styled with Logo Gold & Blue */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-left sm:text-right shrink-0">
                        <span className="text-[10px] font-extrabold text-[#C3EFCF] uppercase tracking-wider block flex items-center justify-start sm:justify-end gap-1">
                            <Sparkles className="w-3 h-3 text-[#E69500]" /> Total Procured
                        </span>
                        <span className="text-xl font-black text-[#E69500] block leading-tight mt-0.5">
                            {formatETB(stats.total_procurement_etb)}
                        </span>
                    </div>
                </div>
            </div>

            {/* 6 METRIC STAT CARDS WITH TOP ACCENT STRIPS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Card 1: Active Purchase Orders (Green Accent Strip) */}
                <div className="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#1E9444]" />
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-[#5A6270]">Active Purchase Orders</span>
                            <h3 className="text-2xl font-black text-[#1E2328] mt-1">{stats.active_orders}</h3>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1E9444] border border-emerald-100 flex items-center justify-center shrink-0">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#1E9444]">Live Escrow Locked Purchases</span>
                </div>

                {/* Card 2: Regional Sourcing Hubs (Amber Accent Strip) */}
                <div className="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#F5B73A]" />
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-[#5A6270]">Regional Sourcing Hubs</span>
                            <h3 className="text-2xl font-black text-[#1E2328] mt-1">{stats.regional_hubs_count}</h3>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#F5B73A] border border-amber-100 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700">Sidama & Oromia Logistics Depots</span>
                </div>

                {/* Card 3: Primary Union Co-ops (Red/Coral Accent Strip) */}
                <div className="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#E6533C]" />
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-[#5A6270]">Primary Union Co-ops</span>
                            <h3 className="text-2xl font-black text-[#1E2328] mt-1">{stats.primary_unions_count}</h3>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E6533C] border border-red-100 flex items-center justify-center shrink-0">
                            <UserCheck className="w-5 h-5" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-red-600">Direct Agricultural Co-operatives</span>
                </div>

                {/* Card 4: Verified Farmer Suppliers (Teal Accent Strip) */}
                <div className="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#14B8A6]" />
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-[#5A6270]">Verified Farmer Suppliers</span>
                            <h3 className="text-2xl font-black text-[#1E2328] mt-1">{stats.verified_farmers_count.toLocaleString()}</h3>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#14B8A6] border border-teal-100 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700">0% Broker Markup Guarantee</span>
                </div>

                {/* Card 5: Pending Delivery Handoffs (Amber Accent Strip) */}
                <div className="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-[#5A6270]">Pending Delivery Handoffs</span>
                            <h3 className="text-2xl font-black text-[#1E2328] mt-1">{stats.pending_handoffs_count}</h3>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                            <PackageCheck className="w-5 h-5" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700">PIN Verification Ready at Depot</span>
                </div>

                {/* Card 6: Active Contracts & RFQs (Royal Blue Accent Strip) */}
                <div className="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#0B57D0]" />
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-[#5A6270]">Active Contracts & RFQs</span>
                            <h3 className="text-2xl font-black text-[#1E2328] mt-1">{stats.active_contracts_count}</h3>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B57D0] border border-blue-100 flex items-center justify-center shrink-0">
                            <Zap className="w-5 h-5" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#0B57D0]">Long-Term Supply Agreements</span>
                </div>
            </div>

            {/* LIVE ORDER TRANSIT STATUS CARD */}
            <div
                onClick={() => navigate('/buyer/orders')}
                className="w-full bg-[#EDFAF2] border border-[#C3EFCF] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#D8F6E0] transition-colors shadow-2xs"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#1E9444] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Truck className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs font-extrabold text-[#0F5C2A]">
                                {latestTransitOrder ? `Order #${latestTransitOrder.id} in Transit` : 'Order #ORD-8921 in Transit'}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-[#1E9444] text-white text-[10px] font-extrabold">Chapa Escrow Secured</span>
                        </div>
                        <p className="text-[11px] text-[#5A6270] mt-0.5 font-medium">
                            {latestTransitOrder
                                ? `${latestTransitOrder.listing.cropName} (${latestTransitOrder.quantityKg} kg) · Driver: Kebede T.`
                                : 'Sidama Coffee Grade 1 → Hawassa Hub to Addis Ababa Warehouse · Driver: Kebede T.'}
                        </p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#1E9444] shrink-0" />
            </div>

            {/* CATEGORY EXPLORATION ROW */}
            <div className="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-[#1E2328]">Explore Produce Categories</h3>
                    <span className="text-[11px] font-bold text-[#1E9444]">Direct Co-op Sourcing</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${selectedCategory === 'all'
                            ? 'bg-[#1E9444] text-white shadow-xs'
                            : 'bg-[#F8F9FA] border border-gray-200 text-[#5A6270] hover:bg-gray-100'
                            }`}
                    >
                        🌱 All Crops
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setSelectedCategory(cat.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${selectedCategory === cat.key
                                ? 'bg-[#1E9444] text-white shadow-xs'
                                : 'bg-[#F8F9FA] border border-gray-200 text-[#5A6270] hover:bg-gray-100'
                                }`}
                        >
                            <span>{cat.emoji}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* PRODUCE LISTINGS & SOURCING SECTION */}
            <div className="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-xs space-y-4">

                {/* Status Bar Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#1E9444] animate-pulse" />
                        <h3 className="text-sm sm:text-base font-black text-[#1E2328]">
                            Live Produce Marketplace Feed
                        </h3>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            • Direct Harvest Batches
                        </span>
                    </div>

                    <button
                        onClick={() => navigate('/buyer/marketplace')}
                        className="px-4 py-1.5 rounded-xl bg-[#1E9444] text-white font-bold text-xs shadow-xs hover:bg-[#0F5C2A] transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                        <Store className="w-4 h-4" />
                        <span>Browse Marketplace</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Produce Listing Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredListings.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/buyer/listing/${item.id}`)}
                            className="bg-[#F8F9FA] border border-[#E2E4E7] rounded-2xl p-4 flex flex-col justify-between hover:border-[#1E9444] hover:bg-white transition-all cursor-pointer shadow-2xs space-y-3"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-3xl shrink-0 shadow-2xs">
                                        {item.cropEmoji}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-[#1E2328]">{item.cropName}</h4>
                                        <p className="text-[11px] text-[#5A6270] mt-0.5 font-medium flex items-center gap-1">
                                            <span>{item.region || 'Sidama'} Region</span>
                                            <span>·</span>
                                            <span className="text-emerald-700 font-bold">{item.farmer.name}</span>
                                        </p>
                                    </div>
                                </div>

                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#EDFAF2] text-[#0F5C2A] border border-[#C3EFCF]">
                                    {item.grade}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                                <div>
                                    <span className="text-xs font-black text-[#1E2328] block">{formatETB(item.pricePerKg)}/kg</span>
                                    <span className="text-[10px] font-bold text-[#1E9444]">{item.availableQty.toLocaleString()} kg available</span>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/buyer/checkout/${item.id}`);
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <span>Procure</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};
