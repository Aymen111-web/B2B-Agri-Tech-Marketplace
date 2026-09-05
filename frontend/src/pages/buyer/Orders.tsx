import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Truck,
    Clock,
    CheckCircle2,
    Lock,
    ShieldCheck,
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    CreditCard,
    CheckSquare,
    Square,
    PackageCheck,
    Shield,
    ChevronRight
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useListings } from '@/hooks/useListings';
import { OrderTimeline } from '@/components/shared/OrderTimeline';
import { formatETB } from '@/lib/utils';
import { OrderStatus } from '@/types';
import { api } from '@/services/api';

export const Orders: React.FC = () => {
    const navigate = useNavigate();
    const { orders, confirmDelivery } = useOrders();
    const { listings } = useListings();

    const [activeTab, setActiveTab] = useState<'cart' | 'active' | 'delivered'>('cart');
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Cart Items IDs from localStorage
    const [cartItemIds, setCartItemIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('agri_cart_items');
        return saved ? JSON.parse(saved) : ['listing-1', 'listing-3'];
    });

    // Quantities map for cart items (defaulting to 1000kg)
    const [quantities, setQuantities] = useState<Record<string, number>>({
        'listing-1': 2500,
        'listing-3': 1000,
    });

    // Selected items for checkout
    const [selectedCartIds, setSelectedCartIds] = useState<string[]>(cartItemIds);

    useEffect(() => {
        localStorage.setItem('agri_cart_items', JSON.stringify(cartItemIds));
        setSelectedCartIds((prev) => prev.filter((id) => cartItemIds.includes(id)));
    }, [cartItemIds]);

    // Map cart item IDs to actual Listing objects
    const cartListings = listings.filter((l) => cartItemIds.includes(l.id));

    // Calculate totals for selected cart items
    const selectedListings = cartListings.filter((l) => selectedCartIds.includes(l.id));
    const subtotalETB = selectedListings.reduce((sum, item) => {
        const qty = quantities[item.id] || 1000;
        return sum + item.pricePerKg * qty;
    }, 0);

    const logisticsETB = subtotalETB > 0 ? 3500 : 0;
    const platformFeeETB = subtotalETB > 0 ? Math.round(subtotalETB * 0.015) : 0;
    const grandTotalETB = subtotalETB + logisticsETB + platformFeeETB;

    const handleQuantityChange = (id: string, delta: number) => {
        setQuantities((prev) => {
            const current = prev[id] || 1000;
            const updated = Math.max(100, current + delta);
            return { ...prev, [id]: updated };
        });
    };

    const handleRemoveCartItem = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setCartItemIds((prev) => prev.filter((itemId) => itemId !== id));
    };

    const toggleSelectCartItem = (id: string) => {
        setSelectedCartIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedCartIds.length === cartListings.length) {
            setSelectedCartIds([]);
        } else {
            setSelectedCartIds(cartListings.map((l) => l.id));
        }
    };

    const handleSingleItemCheckout = async (listingId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            setIsCheckingOut(true);
            const numId = parseInt(listingId.replace(/\D/g, '')) || 1;
            const qty = quantities[listingId] || 1000;

            const res = await api.checkoutOrder({ listing_id: numId, quantity_kg: qty });

            if (res?.order?.id) {
                const payRes = await api.initiateOrderPayment(res.order.id);
                if (payRes?.checkout_url) {
                    window.location.href = payRes.checkout_url;
                    return;
                }
            }
            navigate(`/buyer/checkout/${listingId}`);
        } catch (err) {
            console.warn('Backend payment fallback to local checkout flow:', err);
            navigate(`/buyer/checkout/${listingId}`);
        } finally {
            setIsCheckingOut(false);
        }
    };

    const handleBulkCheckout = async () => {
        if (selectedListings.length === 0) return;
        try {
            setIsCheckingOut(true);
            const numCartIds = selectedCartIds.map((id) => parseInt(id.replace(/\D/g, '')) || 1);

            const res = await api.checkoutOrder({ cart_item_ids: numCartIds });

            if (res?.order?.id) {
                const payRes = await api.initiateOrderPayment(res.order.id);
                if (payRes?.checkout_url) {
                    window.location.href = payRes.checkout_url;
                    return;
                }
            }
            navigate(`/buyer/checkout/${selectedListings[0].id}?bulk=true&count=${selectedListings.length}`);
        } catch (err) {
            console.warn('Backend bulk payment fallback to local checkout flow:', err);
            navigate(`/buyer/checkout/${selectedListings[0].id}?bulk=true&count=${selectedListings.length}`);
        } finally {
            setIsCheckingOut(false);
        }
    };

    const activeOrders = orders.filter(
        (o) => o.status === 'placed' || o.status === 'confirmed' || o.status === 'dispatched' || o.status === 'in_transit'
    );

    const deliveredOrders = orders.filter(
        (o) => o.status === 'delivered' || o.status === 'completed'
    );

    const getStatusBadge = (status: OrderStatus) => {
        switch (status) {
            case 'in_transit':
            case 'dispatched':
                return (
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-[#0B57D0] border border-blue-200">
                        <Truck className="w-3.5 h-3.5" />
                        In Transit
                    </span>
                );
            case 'placed':
            case 'confirmed':
                return (
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-50 text-[#D88C0A] border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        Escrow Locked
                    </span>
                );
            case 'delivered':
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-[#1E9444] border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Delivered & Released
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        <Lock className="w-3.5 h-3.5" />
                        Processing
                    </span>
                );
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#F0F2F5] text-[#1E2328] font-sans pb-16 max-w-5xl mx-auto space-y-5 animate-fade-in">

            {/* CLEAR TOP HEADER & SEGMENTED TABS */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-[#1E2328] tracking-tight">
                            Purchase Orders & Escrow Hub
                        </h1>
                        <p className="text-xs text-[#5A6270] mt-0.5 font-medium">
                            Clear overview of draft procurement items, active Chapa escrow shipments, and trade receipts
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-[#1E9444] border border-emerald-200 text-xs font-extrabold shrink-0 w-fit">
                        <ShieldCheck className="w-4 h-4 text-[#1E9444]" />
                        <span>Chapa Escrow Protected</span>
                    </div>
                </div>

                {/* SEGMENTED SUB-TABS BAR */}
                <div className="flex items-center p-1 bg-[#F8F9FA] rounded-2xl border border-gray-200/60 max-w-md">

                    {/* Tab 1: Draft Cart */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('cart')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'cart'
                                ? 'bg-white text-[#1E9444] shadow-xs border border-gray-200/80'
                                : 'text-[#5A6270] hover:text-[#1E2328]'
                            }`}
                    >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Draft Cart</span>
                        {cartListings.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-[#1E9444] text-white text-[10px] font-black">
                                {cartListings.length}
                            </span>
                        )}
                    </button>

                    {/* Tab 2: Active Orders */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'active'
                                ? 'bg-white text-[#1E9444] shadow-xs border border-gray-200/80'
                                : 'text-[#5A6270] hover:text-[#1E2328]'
                            }`}
                    >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Active</span>
                        {activeOrders.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-[#0B57D0] text-white text-[10px] font-black">
                                {activeOrders.length}
                            </span>
                        )}
                    </button>

                    {/* Tab 3: Delivered */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('delivered')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'delivered'
                                ? 'bg-white text-[#1E9444] shadow-xs border border-gray-200/80'
                                : 'text-[#5A6270] hover:text-[#1E2328]'
                            }`}
                    >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Delivered</span>
                        {deliveredOrders.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                                {deliveredOrders.length}
                            </span>
                        )}
                    </button>

                </div>
            </div>

            {/* TAB CONTENT 1: DRAFT CART */}
            {activeTab === 'cart' && (
                <div>
                    {cartListings.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                            {/* Left Column: Items List */}
                            <div className="lg:col-span-7 space-y-3">

                                {/* Select All Action Bar */}
                                <div className="bg-white border border-gray-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={toggleSelectAll}
                                        className="flex items-center gap-2 text-xs font-extrabold text-[#1E2328] hover:text-[#1E9444] transition-colors cursor-pointer"
                                    >
                                        {selectedCartIds.length === cartListings.length ? (
                                            <CheckSquare className="w-4 h-4 text-[#1E9444]" />
                                        ) : (
                                            <Square className="w-4 h-4 text-gray-400" />
                                        )}
                                        <span>
                                            Select All ({selectedCartIds.length}/{cartListings.length} selected)
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setCartItemIds([])}
                                        className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Clear Cart</span>
                                    </button>
                                </div>

                                {/* Cart Item Cards */}
                                {cartListings.map((item) => {
                                    const isSelected = selectedCartIds.includes(item.id);
                                    const qty = quantities[item.id] || 1000;
                                    const itemTotal = item.pricePerKg * qty;

                                    return (
                                        <div
                                            key={item.id}
                                            className={`bg-white border rounded-2xl p-4 shadow-2xs transition-all space-y-3.5 ${isSelected ? 'border-[#1E9444] ring-1 ring-[#1E9444]/20' : 'border-gray-200/80'
                                                }`}
                                        >
                                            {/* Item Top Row */}
                                            <div className="flex items-start gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSelectCartItem(item.id)}
                                                    className="mt-1 cursor-pointer text-[#1E9444]"
                                                >
                                                    {isSelected ? (
                                                        <CheckSquare className="w-5 h-5 text-[#1E9444]" />
                                                    ) : (
                                                        <Square className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </button>

                                                <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] border border-gray-200 flex items-center justify-center text-2xl shrink-0">
                                                    {item.cropEmoji}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-black text-[#1E2328]">{item.cropName}</h4>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleRemoveCartItem(item.id, e)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                                                            title="Remove item"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <p className="text-xs text-[#5A6270] mt-0.5 font-medium">
                                                        Farmer: <span className="font-bold text-[#1E2328]">{item.farmer.name}</span> · {item.region} Union
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Quantity & Subtotal Row */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-[#5A6270]">Batch Weight:</span>
                                                    <div className="flex items-center border border-gray-200 rounded-xl bg-[#F8F9FA] p-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuantityChange(item.id, -500)}
                                                            className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 cursor-pointer"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="px-2.5 text-xs font-black text-[#1E2328]">
                                                            {qty.toLocaleString()} kg
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuantityChange(item.id, 500)}
                                                            className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 cursor-pointer"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-3">
                                                    <div className="text-right">
                                                        <span className="text-[11px] text-[#5A6270] block">{formatETB(item.pricePerKg)}/kg</span>
                                                        <span className="text-sm font-black text-[#1E9444]">{formatETB(itemTotal)}</span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        disabled={isCheckingOut}
                                                        onClick={(e) => handleSingleItemCheckout(item.id, e)}
                                                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-[#1E9444] disabled:opacity-50 text-[#1E9444] hover:text-white border border-emerald-200 font-extrabold text-xs shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <span>{isCheckingOut ? 'Processing...' : 'Pay Separately'}</span>
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Right Column: Clear Escrow Summary */}
                            <div className="lg:col-span-5 space-y-4">
                                <div className="bg-white border border-gray-200/80 rounded-3xl p-5 shadow-xs space-y-4">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                        <h3 className="text-sm font-black text-[#1E2328] tracking-tight">
                                            Procurement Escrow Summary
                                        </h3>
                                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                            Chapa Escrow
                                        </span>
                                    </div>

                                    {/* Cost Breakdown */}
                                    <div className="space-y-2 text-xs font-medium">
                                        <div className="flex justify-between text-[#5A6270]">
                                            <span>Subtotal ({selectedListings.length} selected batches)</span>
                                            <span className="font-bold text-[#1E2328]">{formatETB(subtotalETB)}</span>
                                        </div>
                                        <div className="flex justify-between text-[#5A6270]">
                                            <span>Regional Logistics Transport</span>
                                            <span className="font-bold text-[#1E2328]">{formatETB(logisticsETB)}</span>
                                        </div>
                                        <div className="flex justify-between text-[#5A6270]">
                                            <span>Platform Protection Fee (1.5%)</span>
                                            <span className="font-bold text-[#1E2328]">{formatETB(platformFeeETB)}</span>
                                        </div>

                                        <div className="flex justify-between text-sm font-black text-[#1E2328] pt-3 border-t border-gray-100">
                                            <span>Total Amount to Lock</span>
                                            <span className="text-base font-black text-[#1E9444]">{formatETB(grandTotalETB)}</span>
                                        </div>
                                    </div>

                                    {/* CHECKOUT ALL BUTTON */}
                                    <button
                                        type="button"
                                        disabled={selectedListings.length === 0 || isCheckingOut}
                                        onClick={handleBulkCheckout}
                                        className="w-full py-3 px-4 rounded-2xl bg-[#1E9444] hover:bg-[#0F5C2A] disabled:opacity-50 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        <span>{isCheckingOut ? 'Initiating Payment...' : `Checkout All Selected (${formatETB(grandTotalETB)})`}</span>
                                    </button>

                                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-[11px] text-[#0F5C2A] font-medium flex items-start gap-2">
                                        <Shield className="w-4 h-4 text-[#1E9444] shrink-0 mt-0.5" />
                                        <span>Your funds remain safely locked in Chapa Escrow until you confirm produce receipt at destination depot with your PIN.</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200/80 p-8 space-y-3 shadow-2xs">
                            <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#1E9444] flex items-center justify-center mx-auto text-2xl shadow-2xs">
                                🛒
                            </div>
                            <div>
                                <h3 className="text-base font-black text-[#1E2328]">Draft Cart Empty</h3>
                                <p className="text-xs text-[#5A6270] mt-1 max-w-sm mx-auto font-medium">
                                    Add produce batches from the regional marketplace to initiate purchase orders.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate('/buyer/marketplace')}
                                className="px-5 py-2.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                            >
                                <span>Browse Marketplace</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT 2: ACTIVE ESCROW ORDERS */}
            {activeTab === 'active' && (
                <div className="space-y-4">
                    {activeOrders.length > 0 ? (
                        activeOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white border border-gray-200/80 rounded-3xl p-5 shadow-2xs space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-[#1E2328]">
                                            Order #{order.id}
                                        </span>
                                        <span className="text-[11px] text-[#5A6270] font-medium">
                                            · Ref: {order.escrowReference}
                                        </span>
                                    </div>
                                    {getStatusBadge(order.status)}
                                </div>

                                <div className="flex items-center gap-3 bg-[#F8F9FA] p-3.5 rounded-2xl border border-gray-200/60">
                                    <span className="text-3xl shrink-0 leading-none">{order.listing.cropEmoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-black text-[#1E2328] truncate">
                                            {order.listing.cropName}
                                        </h4>
                                        <p className="text-xs text-[#5A6270] font-medium truncate mt-0.5">
                                            {order.quantityKg.toLocaleString()} kg · Producer: <span className="font-bold text-[#1E2328]">{order.farmer.name}</span> ({order.farmer.region})
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-xs font-bold text-[#5A6270] block">Escrow Amount</span>
                                        <span className="text-sm font-black text-[#1E9444]">{formatETB(order.totalAmountETB)}</span>
                                    </div>
                                </div>

                                <OrderTimeline status={order.status} />

                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#5A6270]">
                                        Status: Goods in transit to depot
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => confirmDelivery(order.id)}
                                        className="px-4 py-2 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white text-xs font-extrabold shadow-xs flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <ShieldCheck className="w-4 h-4 text-emerald-200" />
                                        <span>Verify Delivery PIN</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200/80 p-6 shadow-2xs">
                            <span className="text-4xl block mb-2">🚚</span>
                            <h4 className="text-sm font-black text-[#1E2328]">No Active Shipments</h4>
                            <p className="text-xs text-[#5A6270] mt-1 font-medium">
                                Active orders in Chapa Escrow transit will appear here.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT 3: DELIVERED & HISTORY */}
            {activeTab === 'delivered' && (
                <div className="space-y-4">
                    {deliveredOrders.length > 0 ? (
                        deliveredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white border border-gray-200/80 rounded-3xl p-5 shadow-2xs space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-[#1E2328]">
                                        Order #{order.id} · Ref: {order.escrowReference}
                                    </span>
                                    {getStatusBadge(order.status)}
                                </div>

                                <div className="flex items-center gap-3 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100">
                                    <span className="text-3xl shrink-0">{order.listing.cropEmoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-black text-[#1E2328]">{order.listing.cropName}</h4>
                                        <p className="text-xs text-[#5A6270] font-medium mt-0.5">
                                            {order.quantityKg.toLocaleString()} kg · Delivered to Addis Hub
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-[#1E9444] block">{formatETB(order.totalAmountETB)}</span>
                                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                                            Escrow Payout Completed
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200/80 p-6 shadow-2xs">
                            <span className="text-4xl block mb-2">✅</span>
                            <h4 className="text-sm font-black text-[#1E2328]">No Delivered History</h4>
                            <p className="text-xs text-[#5A6270] mt-1 font-medium">
                                Delivered orders with completed escrow releases will appear here.
                            </p>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};
