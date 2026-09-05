import React, { useState } from 'react';
import { Truck, Clock, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { OrderTimeline } from '@/components/shared/OrderTimeline';
import { formatETB } from '@/lib/utils';
import { OrderStatus } from '@/types';

export const Orders: React.FC = () => {
    const { orders, confirmDelivery } = useOrders();
    const [activeTab, setActiveTab] = useState<'active' | 'delivered' | 'cancelled'>('active');

    const filteredOrders = orders.filter((order) => {
        if (activeTab === 'active') {
            return (
                order.status === 'placed' ||
                order.status === 'confirmed' ||
                order.status === 'dispatched' ||
                order.status === 'in_transit'
            );
        }
        if (activeTab === 'delivered') {
            return order.status === 'delivered' || order.status === 'completed';
        }
        return order.status === 'disputed';
    });

    const getStatusPill = (status: OrderStatus) => {
        switch (status) {
            case 'in_transit':
            case 'dispatched':
                return (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        <Truck className="w-3 h-3" />
                        In transit
                    </span>
                );
            case 'placed':
            case 'confirmed':
                return (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFF8EC] text-[#D88C0A] border border-[#FFE5A5]">
                        <Clock className="w-3 h-3" />
                        Order placed
                    </span>
                );
            case 'delivered':
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#EDFAF2] text-[#0F5C2A] border border-[#C3EFCF]">
                        <CheckCircle2 className="w-3 h-3" />
                        Delivered & Released
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                        <Lock className="w-3 h-3" />
                        Escrow Held
                    </span>
                );
        }
    };

    return (
        <div className="w-full flex flex-col min-h-full pb-8">
            {/* Top section (white bg) */}
            <div className="bg-white border-b border-[#E2E4E7] px-5 pt-4 pb-0 sticky top-14 z-30">
                <h1 className="text-[18px] font-bold text-[#1E2328]">Your orders</h1>

                {/* Tabs: Active | Delivered | Cancelled */}
                <div className="flex gap-6 mt-4 text-[13px] font-semibold border-b border-[#E2E4E7]">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`pb-2.5 relative transition-colors ${activeTab === 'active' ? 'text-[#1E9444]' : 'text-[#5A6270] hover:text-[#1E2328]'
                            }`}
                    >
                        Active
                        {activeTab === 'active' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E9444] rounded-t-full" />
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('delivered')}
                        className={`pb-2.5 relative transition-colors ${activeTab === 'delivered' ? 'text-[#1E9444]' : 'text-[#5A6270] hover:text-[#1E2328]'
                            }`}
                    >
                        Delivered
                        {activeTab === 'delivered' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E9444] rounded-t-full" />
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('cancelled')}
                        className={`pb-2.5 relative transition-colors ${activeTab === 'cancelled' ? 'text-[#1E9444]' : 'text-[#5A6270] hover:text-[#1E2328]'
                            }`}
                    >
                        Cancelled
                        {activeTab === 'cancelled' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E9444] rounded-t-full" />
                        )}
                    </button>
                </div>
            </div>

            {/* Order Cards */}
            <div className="p-4 space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                        const canConfirm =
                            order.status !== 'delivered' &&
                            order.status !== 'completed' &&
                            order.escrowStatus === 'held';

                        return (
                            <div
                                key={order.id}
                                className="bg-white border border-[#E2E4E7] rounded-xl p-4 shadow-xs space-y-4"
                            >
                                {/* Header row: order ID + status pill */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[12px] font-bold text-[#5A6270]">
                                            Order #{order.id}
                                        </span>
                                        <span className="text-[11px] text-[#9BA1AA]">
                                            · Ref: {order.escrowReference}
                                        </span>
                                    </div>
                                    {getStatusPill(order.status)}
                                </div>

                                {/* Product row */}
                                <div className="flex items-center gap-3 bg-[#F8F9FA] p-3 rounded-lg border border-[#E2E4E7]/60">
                                    <span className="text-[28px] shrink-0 leading-none">{order.listing.cropEmoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[14px] font-bold text-[#1E2328] truncate">
                                            {order.listing.cropName}
                                        </h4>
                                        <p className="text-[12px] text-[#5A6270] truncate">
                                            {order.quantityKg.toLocaleString()} kg · Farmer: {order.farmer.name} (
                                            {order.farmer.region})
                                        </p>
                                    </div>
                                </div>

                                {/* OrderTimeline component */}
                                <OrderTimeline status={order.status} />

                                {/* Footer row (border-top) */}
                                <div className="pt-3 border-t border-[#E2E4E7] flex items-center justify-between">
                                    <div>
                                        <span className="text-[11px] text-[#5A6270] font-medium block">
                                            Escrow Amount
                                        </span>
                                        <span className="text-[16px] font-extrabold text-[#1E9444]">
                                            {formatETB(order.totalAmountETB)}
                                        </span>
                                    </div>

                                    {canConfirm ? (
                                        <button
                                            onClick={() => confirmDelivery(order.id)}
                                            className="px-4 py-2 rounded-full bg-[#1E9444] text-white text-[12px] font-bold btn-hover shadow-xs flex items-center gap-1.5 hover:bg-[#0F5C2A]"
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>Confirm delivery</span>
                                        </button>
                                    ) : (
                                        <span className="text-[12px] font-semibold text-[#0F5C2A] bg-[#EDFAF2] px-3 py-1.5 rounded-full border border-[#C3EFCF]">
                                            Escrow Released
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-[#E2E4E7] p-6 mt-4">
                        <span className="text-4xl block mb-2">📦</span>
                        <h4 className="text-[15px] font-bold text-[#1E2328]">No orders found</h4>
                        <p className="text-[12px] text-[#5A6270] mt-1">
                            You have no {activeTab} orders at this moment.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
