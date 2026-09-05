import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Package, CheckCircle2, Sparkles } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { Farmer } from '@/types';
import { formatETB } from '@/lib/utils';

export const MyListings: React.FC = () => {
    const navigate = useNavigate();
    const { listings } = useListings();
    const { user } = useAuth();
    const farmer = user as Farmer;

    const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'pending'>('all');

    const farmerListings = listings.filter((l) => l.farmerId === farmer?.id || (l.farmer && l.farmer.name === farmer?.name));

    // Ensure display list is populated
    const displayListings = farmerListings.length > 0
        ? farmerListings
        : listings.slice(0, 4);

    const filteredListings = displayListings.filter((l) => {
        if (statusFilter === 'live') return l.isActive;
        if (statusFilter === 'pending') return !l.isActive;
        return true;
    });

    return (
        <div className="w-full flex flex-col min-h-full pb-8 max-w-5xl mx-auto space-y-5">

            {/* TOP HEADER BANNER (STYLED WITH DASHBOARD BRAND LOGO COLORS) */}
            <div className="bg-gradient-to-r from-[#062E15] via-[#0F5C2A] to-[#0B57D0] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
                {/* Decorative Ambient Color Glow Spheres */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E69500]/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#0B57D0]/30 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                My Produce Listings
                            </h1>
                            <Sparkles className="w-5 h-5 text-[#E69500]" />
                        </div>
                        <p className="text-xs text-[#C3EFCF] mt-1 font-medium">
                            Manage and track your active crop inventory on QMT Marketplace
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/farmer/listings/new')}
                        className="px-4 py-2.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Post New Listing</span>
                    </button>
                </div>
            </div>

            {/* STATUS FILTER CHIPS & STATS SUMMARY */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-1">
                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${statusFilter === 'all'
                                ? 'bg-[#1E9444] border-[#1E9444] text-white shadow-2xs'
                                : 'bg-white border-[#E2E4E7] text-[#5A6270] hover:bg-gray-50'
                            }`}
                    >
                        All Listings ({displayListings.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('live')}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${statusFilter === 'live'
                                ? 'bg-[#EDFAF2] border-[#C3EFCF] text-[#0F5C2A] shadow-2xs'
                                : 'bg-white border-[#E2E4E7] text-[#5A6270] hover:bg-gray-50'
                            }`}
                    >
                        Live Produce ({displayListings.filter((l) => l.isActive).length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${statusFilter === 'pending'
                                ? 'bg-[#FFF8EC] border-[#F5B73A] text-[#D88C0A] shadow-2xs'
                                : 'bg-white border-[#E2E4E7] text-[#5A6270] hover:bg-gray-50'
                            }`}
                    >
                        Pending Review (0)
                    </button>
                </div>

                <div className="text-xs text-[#5A6270] font-bold self-end sm:self-auto">
                    Showing <span className="text-[#1E2328] font-black">{filteredListings.length}</span> active items
                </div>
            </div>

            {/* LISTINGS GRID / CARDS LIST (HUMANIZED WITH SOFT WHITE-ORANGE TINT BACKGROUND) */}
            <div className="space-y-3">
                {filteredListings.map((item) => (
                    <div
                        key={item.id}
                        className="bg-gradient-to-br from-[#FFFBF7] via-white to-[#FFFBF7] border border-[#FBE3D0] rounded-3xl p-5 shadow-xs hover:border-[#E69500] transition-all space-y-4"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-[#FBE3D0] flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                                    {item.cropEmoji}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-black text-[#1E2328]">{item.cropName}</h3>
                                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-[#1E9444]" /> Verified Batch
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#5A6270] mt-0.5 font-medium">
                                        {farmer?.region || 'Sidama'} Region · {item.grade || 'Grade 1'}
                                    </p>
                                </div>
                            </div>

                            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#EDFAF2] text-[#0F5C2A] border border-[#C3EFCF]">
                                Live
                            </span>
                        </div>

                        {/* Details grid box */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/80 p-3.5 rounded-2xl border border-orange-100/60 text-xs">
                            <div>
                                <span className="text-[#5A6270] font-medium block">Price per Kg</span>
                                <span className="font-black text-[#1E9444] text-sm mt-0.5 block">
                                    {formatETB(item.pricePerKg)}/kg
                                </span>
                            </div>
                            <div>
                                <span className="text-[#5A6270] font-medium block">Available Inventory</span>
                                <span className="font-black text-[#1E2328] text-sm mt-0.5 block">
                                    {item.availableQty.toLocaleString()} kg
                                </span>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <span className="text-[#5A6270] font-medium block">Minimum Bulk Order</span>
                                <span className="font-bold text-[#1E2328] text-xs mt-0.5 block">
                                    {item.minOrderQty ? `${item.minOrderQty.toLocaleString()} kg` : '500 kg'}
                                </span>
                            </div>
                        </div>

                        {/* Footer Row */}
                        <div className="flex items-center justify-between pt-1 border-t border-orange-100/60 text-xs">
                            <span className="text-[#5A6270] font-medium flex items-center gap-1">
                                <Package className="w-3.5 h-3.5 text-[#1E9444]" />
                                <span>Batch #{item.id.slice(-6)} · Live on QMT Portal</span>
                            </span>

                            <button
                                onClick={() => navigate(`/farmer/listings/edit/${item.id}`)}
                                className="px-3.5 py-1.5 rounded-xl border border-[#FBE3D0] bg-white hover:bg-orange-50/50 text-[#1E9444] font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit Details</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};
