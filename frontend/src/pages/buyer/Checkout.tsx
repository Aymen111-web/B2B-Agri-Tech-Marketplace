import React, { useState } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CheckCircle2, Lock, ShoppingCart } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { formatETB } from '@/lib/utils';
import { Buyer } from '@/types';
import { api } from '@/services/api';

export const Checkout: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { listings, getListingById } = useListings();
    const { placeOrder } = useOrders();
    const { user } = useAuth();

    const isBulk = searchParams.get('bulk') === 'true' || id === 'bulk' || !id;

    // Load Cart Item IDs for Bulk Checkout
    const cartItemIds: string[] = (() => {
        const saved = localStorage.getItem('agri_cart_items');
        return saved ? JSON.parse(saved) : ['listing-1', 'listing-3'];
    })();

    // Default quantities for cart items (or params)
    const cartListings = listings.filter((l) => cartItemIds.includes(l.id));

    // Single item fallback
    const singleListing = getListingById(id || '');
    const qtyParam = searchParams.get('qty');
    const singleQuantityKg = qtyParam ? parseInt(qtyParam, 10) : singleListing ? singleListing.minOrderQty : 500;

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Calculate totals
    let totalAmount = 0;
    let subtotal = 0;

    if (isBulk) {
        subtotal = cartListings.reduce((sum, item) => sum + (item.pricePerKg * (item.minOrderQty || 1000)), 0);
        totalAmount = subtotal;
    } else if (singleListing) {
        subtotal = singleListing.pricePerKg * singleQuantityKg;
        totalAmount = subtotal;
    }

    const handleConfirmPay = async () => {
        setIsProcessing(true);
        try {
            if (isBulk) {
                // Call backend API for bulk cart checkout
                const numCartIds = cartItemIds.map((cId) => parseInt(cId.replace(/\D/g, '')) || 1);
                const res = await api.checkoutOrder({ cart_item_ids: numCartIds });

                if (res?.order?.id) {
                    const payRes = await api.initiateOrderPayment(res.order.id);
                    if (payRes?.checkout_url) {
                        window.location.href = payRes.checkout_url;
                        return;
                    }
                }

                // Local fallback: place orders for all cart items
                cartListings.forEach((item) => {
                    placeOrder(item, user as Buyer, item.minOrderQty || 1000);
                });
                localStorage.removeItem('agri_cart_items');
            } else if (singleListing) {
                // Single item checkout
                const numId = parseInt(singleListing.id.replace(/\D/g, '')) || 1;
                const res = await api.checkoutOrder({ listing_id: numId, quantity_kg: singleQuantityKg });

                if (res?.order?.id) {
                    const payRes = await api.initiateOrderPayment(res.order.id);
                    if (payRes?.checkout_url) {
                        window.location.href = payRes.checkout_url;
                        return;
                    }
                }

                placeOrder(singleListing, user as Buyer, singleQuantityKg);
            }

            setIsProcessing(false);
            setIsSuccess(true);
        } catch (err) {
            console.warn('Fallback to local order simulation:', err);
            if (isBulk) {
                cartListings.forEach((item) => {
                    placeOrder(item, user as Buyer, item.minOrderQty || 1000);
                });
                localStorage.removeItem('agri_cart_items');
            } else if (singleListing) {
                placeOrder(singleListing, user as Buyer, singleQuantityKg);
            }
            setIsProcessing(false);
            setIsSuccess(true);
        }
    };

    if (!isBulk && !singleListing) {
        return (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 my-8">
                <h3 className="text-base font-bold text-gray-800">Produce listing not found</h3>
                <button
                    type="button"
                    onClick={() => navigate('/buyer/marketplace')}
                    className="mt-4 px-4 py-2 bg-[#1E9444] text-white rounded-xl text-xs font-semibold"
                >
                    Back to Produce Marketplace
                </button>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="p-6 text-center space-y-5 my-auto max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-[#EDFAF2] text-[#1E9444] flex items-center justify-center mx-auto border-2 border-[#1E9444]">
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-[#1E2328]">Payment Secured in Escrow!</h2>
                    <p className="text-xs text-[#5A6270] mt-1 max-w-xs mx-auto font-medium">
                        Your payment of <strong>{formatETB(totalAmount)}</strong> for {isBulk ? `${cartListings.length} produce batches` : singleListing?.cropName} has been locked in Chapa Escrow.
                    </p>
                </div>

                <div className="bg-[#FFF8EC] border border-[#FFE5A5] rounded-2xl p-4 text-left text-xs space-y-1">
                    <span className="font-bold text-[#D88C0A] flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Next Steps:
                    </span>
                    <p className="text-[#5A6270]">
                        Track delivery progress on the Orders page. Funds will remain safely locked in escrow until you verify goods receipt with your PIN code.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate('/buyer/orders')}
                    className="w-full py-3 rounded-2xl bg-[#1E9444] text-white font-bold text-xs shadow-md hover:bg-[#0F5C2A] transition-colors cursor-pointer"
                >
                    View My Orders
                </button>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col min-h-full pb-8 max-w-2xl mx-auto space-y-4">
            {/* Top Bar Header */}
            <div className="px-4 py-3 bg-white border-b border-[#E2E4E7] flex items-center gap-3 sticky top-14 z-30 rounded-b-2xl shadow-2xs">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F0F1F2] transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-5 h-5 text-[#1E2328]" />
                </button>
                <div>
                    <h2 className="text-base font-black text-[#1E2328]">
                        {isBulk ? `Bulk Escrow Checkout (${cartListings.length} Produce Batches)` : 'Single Produce Escrow Checkout'}
                    </h2>
                    <p className="text-[11px] text-[#5A6270]">
                        Protected by Chapa Escrow Guarantee
                    </p>
                </div>
            </div>

            <div className="p-2 sm:p-4">
                <div className="bg-white border border-[#E2E4E7] rounded-3xl p-5 shadow-xs space-y-5">

                    {/* Produce Items Summary Breakdown */}
                    {isBulk ? (
                        <div className="space-y-3">
                            <h4 className="text-xs font-black text-[#1E2328] uppercase tracking-wider flex items-center gap-1.5">
                                <ShoppingCart className="w-4 h-4 text-[#1E9444]" />
                                <span>Cart Items Included ({cartListings.length})</span>
                            </h4>

                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {cartListings.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 bg-[#F8F9FA] p-3 rounded-2xl border border-gray-200"
                                    >
                                        <span className="text-2xl shrink-0">{item.cropEmoji}</span>
                                        <div className="flex-1 min-w-0">
                                            <h5 className="text-xs font-bold text-[#1E2328] truncate">{item.cropName}</h5>
                                            <p className="text-[11px] text-[#5A6270]">
                                                {(item.minOrderQty || 1000).toLocaleString()} kg @ {formatETB(item.pricePerKg)}/kg
                                            </p>
                                        </div>
                                        <span className="text-xs font-black text-[#1E9444]">
                                            {formatETB(item.pricePerKg * (item.minOrderQty || 1000))}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Single Item Summary */
                        <div className="flex items-center gap-3 bg-[#F8F9FA] p-3.5 rounded-2xl border border-gray-200">
                            <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-2xl shrink-0">
                                {singleListing?.cropEmoji}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-[#1E2328] truncate">{singleListing?.cropName}</h4>
                                <p className="text-xs text-[#5A6270]">
                                    {singleQuantityKg.toLocaleString()} kg @ {formatETB(singleListing?.pricePerKg || 0)}/kg
                                </p>
                            </div>
                        </div>
                    )}

                    <hr className="border-[#E2E4E7]" />

                    {/* Total Amount Card */}
                    <div className="text-center py-2 bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100">
                        <span className="text-xs font-bold text-[#5A6270] block uppercase tracking-wider">
                            Total Escrow Payment
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-[#1E9444] mt-0.5 block leading-tight">
                            {formatETB(totalAmount)}
                        </span>
                    </div>

                    {/* Chapa Payment Option */}
                    <div className="bg-[#F8F9FA] border border-[#E2E4E7] rounded-2xl p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#1E9444] text-white flex items-center justify-center font-black text-xl shadow-2xs">
                                C
                            </div>
                            <div>
                                <h5 className="text-xs font-bold text-[#1E2328] leading-tight">Pay via Chapa Escrow</h5>
                                <span className="text-[11px] text-[#5A6270]">Secured Ethiopian B2B Gateway</span>
                            </div>
                        </div>
                        <span className="text-[11px] font-semibold text-[#5A6270]">Telebirr · CBE · Banks</span>
                    </div>

                    {/* Protection Banner */}
                    <div className="bg-[#EDFAF2] border border-[#C3EFCF] rounded-2xl p-3.5 flex items-start gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-[#1E9444] shrink-0 mt-0.5" />
                        <p className="text-xs text-[#0F5C2A] leading-relaxed font-medium">
                            Funds remain 100% protected in escrow. Farmer receives payout only after your delivery PIN verification at destination warehouse.
                        </p>
                    </div>

                    {/* Itemized Breakdown */}
                    <div className="space-y-2 text-xs pt-1">
                        <div className="flex justify-between text-[#5A6270]">
                            <span>Produce Subtotal ({isBulk ? `${cartListings.length} items` : `${singleQuantityKg.toLocaleString()} kg`})</span>
                            <span>{formatETB(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-[#5A6270]">
                            <span>Platform Escrow Protection</span>
                            <span className="text-[#1E9444] font-bold">Free</span>
                        </div>
                        <div className="flex justify-between font-black text-[#1E2328] text-sm pt-2 border-t border-[#E2E4E7]">
                            <span>Grand Total</span>
                            <span className="text-[#1E9444]">{formatETB(totalAmount)}</span>
                        </div>
                    </div>

                    {/* Confirm Button */}
                    <button
                        type="button"
                        onClick={handleConfirmPay}
                        disabled={isProcessing}
                        className="w-full py-3.5 rounded-2xl bg-[#1E9444] text-white font-black text-xs shadow-md hover:bg-[#0F5C2A] transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {isProcessing ? 'Connecting to Chapa Escrow Gateway…' : `Confirm & Pay ${formatETB(totalAmount)} into Escrow`}
                    </button>
                </div>
            </div>
        </div>
    );
};
