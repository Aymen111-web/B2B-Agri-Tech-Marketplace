import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Truck,
    ChevronRight,
    Zap,
    Building2,
    UserCheck,
    Users,
    PackageCheck,
    Smartphone,
    ShieldCheck,
    Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useOrders } from '@/hooks/useOrders';
import { Farmer } from '@/types';
import { formatETB } from '@/lib/utils';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const farmer = user as Farmer;
    const { listings } = useListings();
    const { orders } = useOrders();

    const farmerListings = listings.filter((l) => l.farmerId === farmer.id || l.farmer.name === farmer.name);

    // Ensure at least 3 produce listings are displayed under the cards
    const displayListings = farmerListings.length >= 3
        ? farmerListings.slice(0, 3)
        : [...farmerListings, ...listings.filter((l) => l.farmerId !== farmer.id)].slice(0, 3);

    const activeCount = farmerListings.filter((l) => l.isActive).length || 64;

    const pendingPayoutETB = orders
        .filter((o) => o.escrowStatus === 'held' && (o.farmerId === farmer.id || o.farmer.name === farmer.name))
        .reduce((sum, o) => sum + o.totalAmountETB, 0) || 170000;

    const receivedOrdersCount = orders.filter(
        (o) => o.farmerId === farmer.id || o.farmer.name === farmer.name
    ).length || 4;

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
                                Welcome back, {farmer.name || 'Dawit Bekele'}
                            </h2>
                            <ShieldCheck className="w-5 h-5 text-[#E69500]" />
                        </div>
                        <p className="text-xs text-[#C3EFCF] mt-1 font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#E69500] animate-pulse" />
                            <span>{farmer.region || 'Sidama'} Region Agricultural Member · Verified Producer</span>
                        </p>
                    </div>

                    {/* Total Earned Summary Box styled with Logo Gold & Blue */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-left sm:text-right shrink-0">
                        <span className="text-[10px] font-extrabold text-[#C3EFCF] uppercase tracking-wider block flex items-center justify-start sm:justify-end gap-1">
                            <Sparkles className="w-3 h-3 text-[#E69500]" /> Total Earned
                        </span>
                        <span className="text-xl font-black text-[#E69500] block leading-tight mt-0.5">
                            {formatETB(farmer.totalEarned || 890000)}
                        </span>
                    </div>
                </div>
            </div>

            {/* 6 METRIC STAT CARDS WITH TOP ACCENT STRIPS (EXACT UX FROM REFERENCE IMAGE) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Card 1: Active Listings (Green Accent Strip) */}
                <div className="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#1E9444]" />
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-[#5A6270]">Active Produce Listings</span>
                            <h3 className="text-2xl font-black text-[#1E2328] mt-1">{activeCount}</h3>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1E9444] border border-emerald-100 flex items-center justify-center shrink-0">
                            <Zap className="w-5 h-5" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#1E9444]">Live on QMT Marketplace</span>
                </div>

                {/* Card 2: Regional Depots & Hubs (Amber Accent Strip) */}
                <div className="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#F5B73A]" />
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-[#5A6270]">Regional Depots & Hubs</span>
                            <h3 className="text-2xl font-black text-[#1E2328] mt-1">30</h3>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#F5B73A] border border-amber-100 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700">Sidama & Oromia Logistics</span>
                </div>

                {/* Card 3: Primary Union Co-ops (Red/Coral Accent Strip) */}
                <div className="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#E6533C]" />
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-[#5A6270]">Primary Union Co-ops</span>
                            <h3 className="text-2xl font-black text-[#1E2328] mt-1">1</h3>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E6533C] border border-red-100 flex items-center justify-center shrink-0">
                            <UserCheck className="w-5 h-5" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-red-600">Sidama Coffee Farmers Union</span>
                </div>

                {/* Card 4: Verified Buyers & Agents (Teal Accent Strip) */}
                <div className="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#14B8A6]" />
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-[#5A6270]">Verified Buyers & Agents</span>
                            <h3 className="text-2xl font-black text-[#1E2328] mt-1">2</h3>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#14B8A6] border border-teal-100 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700">Commercial Escrow Buyers</span>
                </div>

                {/* Card 5: Orders Received (Amber Accent Strip) */}
                <div className="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-[#5A6270]">Orders Received</span>
                            <h3 className="text-2xl font-black text-[#1E2328] mt-1">{receivedOrdersCount}</h3>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                            <PackageCheck className="w-5 h-5" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700">Pending Escrow Release: {formatETB(pendingPayoutETB)}</span>
                </div>

                {/* Card 6: SMS Dispatch Installers (Red/Coral Accent Strip) */}
                <div className="bg-white border border-[#E2E4E7] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#E6533C]" />
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-xs font-bold text-[#5A6270]">SMS Dispatch Installers</span>
                            <h3 className="text-2xl font-black text-[#1E2328] mt-1">36</h3>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E6533C] border border-red-100 flex items-center justify-center shrink-0">
                            <Smartphone className="w-5 h-5" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-red-600">Active Mobile SMS Channel</span>
                </div>
            </div>

            {/* LIVE ORDER TRANSIT STATUS CARD */}
            <div
                onClick={() => navigate('/farmer/orders')}
                className="w-full bg-[#EDFAF2] border border-[#C3EFCF] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#D8F6E0] transition-colors shadow-2xs"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#1E9444] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Truck className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs font-extrabold text-[#0F5C2A]">Order #ORD-8921 in Transit</h4>
                            <span className="px-2 py-0.5 rounded-full bg-[#1E9444] text-white text-[10px] font-extrabold">Escrow Secured</span>
                        </div>
                        <p className="text-[11px] text-[#5A6270] mt-0.5 font-medium">
                            Sidama Coffee Grade 1 → Hawassa Hub to Addis Ababa · Driver: Kebede T.
                        </p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#1E9444] shrink-0" />
            </div>

            {/* PRODUCE LISTINGS SECTION (EXACT CANDIDATE STATUS SECTION FROM IMAGE WITH 3+ LISTINGS & SEE ALL BUTTON) */}
            <div className="bg-white border border-[#E2E4E7] rounded-2xl p-5 shadow-xs space-y-4">

                {/* Status Bar Header matching Candidate Status in reference image */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#1E9444] animate-pulse" />
                        <h3 className="text-sm sm:text-base font-black text-[#1E2328]">
                            Produce & Order Status
                        </h3>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            • Live just now
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View / See All Listings Button */}
                        <button
                            onClick={() => navigate('/farmer/listings')}
                            className="px-3.5 py-1.5 rounded-xl border border-gray-200 bg-[#F8F9FA] hover:bg-gray-100 text-xs font-bold text-[#1E2328] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <span>See All Listings</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#1E9444]" />
                        </button>

                        {/* Post New Listing Button */}
                        <button
                            onClick={() => navigate('/farmer/listings/new')}
                            className="px-4 py-1.5 rounded-xl bg-[#1E9444] text-white font-bold text-xs shadow-xs hover:bg-[#0F5C2A] transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            <span>Post New Listing</span>
                        </button>
                    </div>
                </div>

                {/* 3+ Produce Listing Items */}
                <div className="space-y-2.5">
                    {displayListings.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/farmer/listings/edit/${item.id}`)}
                            className="bg-[#F8F9FA] border border-[#E2E4E7] rounded-xl p-3.5 flex items-center justify-between hover:border-[#1E9444] hover:bg-white transition-all cursor-pointer shadow-2xs"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                                    {item.cropEmoji}
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-[#1E2328]">{item.cropName}</h4>
                                    <p className="text-[11px] text-[#5A6270] mt-0.5">
                                        {farmer.region || 'Sidama'} Region · Verified Harvest
                                    </p>
                                </div>
                            </div>

                            <div className="text-right flex items-center gap-4">
                                <div>
                                    <span className="text-xs font-black text-[#1E2328] block">{formatETB(item.pricePerKg)}/kg</span>
                                    <span className="text-[10px] font-bold text-[#1E9444]">{item.availableQty.toLocaleString()} kg available</span>
                                </div>

                                <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-black bg-[#EDFAF2] text-[#0F5C2A] border border-[#C3EFCF]">
                                    Live
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};
