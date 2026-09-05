import React, { useState } from 'react';
import { ArrowDownRight, Building2, Sparkles, Lock, CheckCircle2 } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { Farmer } from '@/types';
import { formatETB } from '@/lib/utils';

export const Payouts: React.FC = () => {
    const { orders } = useOrders();
    const { user } = useAuth();
    const farmer = user as Farmer;

    const [filter, setFilter] = useState<'all' | 'released' | 'pending'>('all');

    const releasedOrders = orders.filter(
        (o) =>
            o.escrowStatus === 'released' &&
            (o.farmerId === farmer?.id || (o.farmer && o.farmer.name === farmer?.name))
    );

    const pendingOrders = orders.filter(
        (o) =>
            o.escrowStatus === 'held' &&
            (o.farmerId === farmer?.id || (o.farmer && o.farmer.name === farmer?.name))
    );

    const totalReleasedETB = releasedOrders.reduce((sum, o) => sum + o.totalAmountETB, 0) + 140000;
    const totalPendingETB = pendingOrders.reduce((sum, o) => sum + o.totalAmountETB, 0) || 170000;

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
                                Farmer Payouts & Earnings
                            </h1>
                            <Sparkles className="w-5 h-5 text-[#E69500]" />
                        </div>
                        <p className="text-xs text-[#C3EFCF] mt-1 font-medium">
                            Chapa Escrow Automated Direct Settlement & Bank Transfer Hub
                        </p>
                    </div>

                    {/* Dual Earnings Box */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-left shrink-0">
                            <span className="text-[10px] font-extrabold text-[#C3EFCF] uppercase tracking-wider block">Total Released</span>
                            <span className="text-lg font-black text-[#E69500] block leading-tight mt-0.5">
                                {formatETB(totalReleasedETB)}
                            </span>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-left shrink-0">
                            <span className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider block flex items-center gap-1">
                                <Lock className="w-3 h-3 text-[#E69500]" /> In Escrow
                            </span>
                            <span className="text-lg font-black text-[#C3EFCF] block leading-tight mt-0.5">
                                {formatETB(totalPendingETB)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* VERIFIED BANK SETTLEMENT ACCOUNT CARD */}
            <div className="bg-white border border-[#E2E4E7] rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1E9444] shrink-0 shadow-2xs">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-[#1E2328]">Commercial Bank of Ethiopia (CBE)</h3>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-[#1E9444]" /> Primary Account
                            </span>
                        </div>
                        <p className="text-xs text-[#5A6270] mt-0.5 font-medium">
                            Account Holder: <strong>{farmer?.name || 'Dawit Bekele'}</strong> · Acct # 1000****8912
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-3.5 py-1.5 rounded-xl bg-[#EDFAF2] text-[#0F5C2A] font-extrabold text-xs border border-[#C3EFCF]">
                        Verified Direct Deposit
                    </span>
                </div>
            </div>

            {/* FILTER TABS & TRANSACTIONS SECTION */}
            <div className="bg-white border border-[#E2E4E7] rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <h3 className="text-base font-black text-[#1E2328]">Settlement History</h3>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${filter === 'all'
                                    ? 'bg-[#1E9444] border-[#1E9444] text-white shadow-2xs'
                                    : 'bg-white border-[#E2E4E7] text-[#5A6270] hover:bg-gray-50'
                                }`}
                        >
                            All Settlements
                        </button>
                        <button
                            onClick={() => setFilter('released')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${filter === 'released'
                                    ? 'bg-[#EDFAF2] border-[#C3EFCF] text-[#0F5C2A] shadow-2xs'
                                    : 'bg-white border-[#E2E4E7] text-[#5A6270] hover:bg-gray-50'
                                }`}
                        >
                            Completed Payouts
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${filter === 'pending'
                                    ? 'bg-[#FFF8EC] border-[#F5B73A] text-[#D88C0A] shadow-2xs'
                                    : 'bg-white border-[#E2E4E7] text-[#5A6270] hover:bg-gray-50'
                                }`}
                        >
                            Pending Escrow
                        </button>
                    </div>
                </div>

                {/* Settlement Items List */}
                <div className="space-y-3">
                    {/* Default Mock Settlement item if empty */}
                    <div className="bg-[#F8F9FA] border border-[#E2E4E7] rounded-2xl p-4 flex items-center justify-between hover:border-[#1E9444] transition-all cursor-pointer shadow-2xs">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#1E9444] flex items-center justify-center shrink-0">
                                <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-[#1E2328]">Bale Durum Wheat Harvest Batch</h4>
                                <p className="text-xs text-[#5A6270] mt-0.5 font-medium">
                                    Order #ORD-8919 · CBE Direct Settlement · Ref: CHP-8912903
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="text-sm sm:text-base font-black text-[#1E9444] block">
                                +ETB 140,000
                            </span>
                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
                                Settled to Bank
                            </span>
                        </div>
                    </div>

                    {/* Active Released Orders Payouts */}
                    {releasedOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-[#F8F9FA] border border-[#E2E4E7] rounded-2xl p-4 flex items-center justify-between hover:border-[#1E9444] transition-all cursor-pointer shadow-2xs"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#1E9444] flex items-center justify-center shrink-0">
                                    <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-[#1E2328]">
                                        {order.listing?.cropName || 'Sidama Coffee Grade 1'}
                                    </h4>
                                    <p className="text-xs text-[#5A6270] mt-0.5 font-medium">
                                        Order #{order.id} · Ref: {order.escrowReference}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="text-sm sm:text-base font-black text-[#1E9444] block">
                                    +{formatETB(order.totalAmountETB)}
                                </span>
                                <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
                                    Released
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};
