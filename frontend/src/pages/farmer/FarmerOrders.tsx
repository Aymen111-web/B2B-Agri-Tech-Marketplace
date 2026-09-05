import React, { useState } from 'react';
import { Truck, CheckCircle2, Lock, Sparkles, Building, ShieldCheck } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { Farmer } from '@/types';
import { formatETB } from '@/lib/utils';
import { OrderTimeline } from '@/components/shared/OrderTimeline';

export const FarmerOrders: React.FC = () => {
    const { orders, updateOrderStatus } = useOrders();
    const { user } = useAuth();
    const farmer = user as Farmer;

    const [statusFilter, setStatusFilter] = useState<'all' | 'escrow' | 'dispatched'>('all');

    const farmerOrders = orders.filter(
        (o) => o.farmerId === farmer?.id || (o.farmer && o.farmer.name === farmer?.name)
    );

    const handleDispatch = (orderId: string) => {
        updateOrderStatus(
            orderId,
            'dispatched',
            'Loaded produce on transport truck heading to buyer delivery location'
        );
    };

    const filteredOrders = farmerOrders.filter((order) => {
        if (statusFilter === 'escrow') return order.escrowStatus === 'held';
        if (statusFilter === 'dispatched') return order.status === 'dispatched' || order.status === 'in_transit' || order.status === 'delivered';
        return true;
    });

    const totalEscrowAmount = farmerOrders
        .filter((o) => o.escrowStatus === 'held')
        .reduce((sum, o) => sum + o.totalAmountETB, 0);

    return (
        <div className="w-full flex flex-col min-h-full pb-8 max-w-5xl mx-auto space-y-5">

            {/* TOP HEADER BANNER (STYLED WITH LOGO BRAND COLORS: ROYAL BLUE #0B57D0, GOLDEN YELLOW #E69500 & EMERALD GREEN #1E9444) */}
            <div className="bg-gradient-to-r from-[#062E15] via-[#0F5C2A] to-[#0B57D0] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
                {/* Decorative Ambient Color Glow Spheres */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E69500]/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#0B57D0]/30 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                Orders Received
                            </h1>
                            <Sparkles className="w-5 h-5 text-[#E69500]" />
                        </div>
                        <p className="text-xs text-[#C3EFCF] mt-1 font-medium">
                            Manage buyer procurement requests, Chapa escrow deposits, and transport dispatches
                        </p>
                    </div>

                    {/* Escrow Held Summary Box */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-left sm:text-right shrink-0">
                        <span className="text-[10px] font-extrabold text-[#C3EFCF] uppercase tracking-wider block flex items-center justify-start sm:justify-end gap-1">
                            <Lock className="w-3 h-3 text-[#E69500]" /> Held in Escrow
                        </span>
                        <span className="text-xl font-black text-[#E69500] block leading-tight mt-0.5">
                            {formatETB(totalEscrowAmount || 170000)}
                        </span>
                    </div>
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
                        All Orders ({farmerOrders.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('escrow')}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${statusFilter === 'escrow'
                                ? 'bg-[#FFF8EC] border-[#F5B73A] text-[#D88C0A] shadow-2xs'
                                : 'bg-white border-[#E2E4E7] text-[#5A6270] hover:bg-gray-50'
                            }`}
                    >
                        Escrow Secured ({farmerOrders.filter((o) => o.escrowStatus === 'held').length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('dispatched')}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${statusFilter === 'dispatched'
                                ? 'bg-[#EDFAF2] border-[#C3EFCF] text-[#0F5C2A] shadow-2xs'
                                : 'bg-white border-[#E2E4E7] text-[#5A6270] hover:bg-gray-50'
                            }`}
                    >
                        In Transit ({farmerOrders.filter((o) => o.status === 'dispatched' || o.status === 'in_transit').length})
                    </button>
                </div>

                <div className="text-xs text-[#5A6270] font-bold self-end sm:self-auto">
                    Showing <span className="text-[#1E2328] font-black">{filteredOrders.length}</span> procurement requests
                </div>
            </div>

            {/* ORDERS CARDS LIST */}
            <div className="space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white border border-[#E2E4E7] rounded-3xl p-5 shadow-xs hover:border-[#1E9444] transition-all space-y-4"
                        >
                            {/* Header Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-black text-[#1E2328]">
                                            Order #{order.id}
                                        </h3>
                                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                                            B2B Direct
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#5A6270] mt-0.5 font-medium flex items-center gap-1.5">
                                        <Building className="w-3.5 h-3.5 text-[#0B57D0]" />
                                        <span>Buyer: <strong>{order.buyer?.companyName || order.buyer?.name || 'Addis Exporters Union'}</strong></span>
                                    </p>
                                </div>

                                {order.escrowStatus === 'held' ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full bg-[#FFF8EC] text-[#D88C0A] border border-[#FFE5A5] self-start sm:self-auto">
                                        <Lock className="w-3.5 h-3.5 text-[#E69500]" />
                                        <span>Chapa Escrow Secured</span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full bg-[#EDFAF2] text-[#0F5C2A] border border-[#C3EFCF] self-start sm:self-auto">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1E9444]" />
                                        <span>Released to Payouts</span>
                                    </span>
                                )}
                            </div>

                            {/* Produce Info Box */}
                            <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-200/70 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                                        {order.listing?.cropEmoji || '☕'}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-[#1E2328]">
                                            {order.listing?.cropName || 'Sidama Coffee Grade 1'}
                                        </h4>
                                        <p className="text-xs text-[#5A6270] mt-0.5 font-medium">
                                            {order.quantityKg?.toLocaleString() || '5,000'} kg harvest batch
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="text-xs text-[#5A6270] font-medium block">Total Value</span>
                                    <span className="text-sm sm:text-base font-black text-[#1E9444]">
                                        {formatETB(order.totalAmountETB)}
                                    </span>
                                </div>
                            </div>

                            {/* Order Timeline Component */}
                            <div className="py-1">
                                <OrderTimeline status={order.status} />
                            </div>

                            {/* Footer Details & Action Button */}
                            <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2 text-[#5A6270]">
                                    <ShieldCheck className="w-4 h-4 text-[#1E9444]" />
                                    <span>Escrow Ref: <strong className="text-[#1E2328] font-bold">{order.escrowReference}</strong></span>
                                </div>

                                {order.status === 'placed' || order.status === 'confirmed' ? (
                                    <button
                                        onClick={() => handleDispatch(order.id)}
                                        className="px-4 py-2 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                                    >
                                        <Truck className="w-4 h-4" />
                                        <span>Dispatch Order Transport</span>
                                    </button>
                                ) : (
                                    <span className="px-3 py-1 rounded-xl bg-gray-100 text-[#1E2328] font-bold text-xs self-end sm:self-auto flex items-center gap-1">
                                        <span>Status:</span>
                                        <strong className="capitalize text-[#1E9444]">{order.status.replace('_', ' ')}</strong>
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-3xl border border-[#E2E4E7] p-6 shadow-xs space-y-2">
                        <span className="text-4xl block">🚜</span>
                        <h4 className="text-base font-black text-[#1E2328]">No procurement orders yet</h4>
                        <p className="text-xs text-[#5A6270] max-w-sm mx-auto">
                            Your produce listings are live on the marketplace. Verified buyer orders will appear here automatically.
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
};
