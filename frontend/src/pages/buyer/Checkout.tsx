import React, { useState } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { formatETB } from '@/lib/utils';
import { Buyer } from '@/types';

export const Checkout: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { getListingById } = useListings();
    const { placeOrder } = useOrders();
    const { user } = useAuth();

    const listing = getListingById(id || '');
    const qtyParam = searchParams.get('qty');
    const quantityKg = qtyParam ? parseInt(qtyParam, 10) : listing ? listing.minOrderQty : 500;

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!listing) {
        return (
            <div className="p-8 text-center">
                <h3 className="text-lg font-bold">Listing not found</h3>
                <button
                    onClick={() => navigate('/buyer/marketplace')}
                    className="mt-4 px-4 py-2 bg-[#1E9444] text-white rounded-full text-sm font-semibold"
                >
                    Back to Marketplace
                </button>
            </div>
        );
    }

    const subtotal = listing.pricePerKg * quantityKg;
    const platformFee = 0; // Free
    const totalAmount = subtotal + platformFee;

    const handleConfirmPay = () => {
        setIsProcessing(true);
        setTimeout(() => {
            placeOrder(listing, user as Buyer, quantityKg);
            setIsProcessing(false);
            setIsSuccess(true);
        }, 1200);
    };

    if (isSuccess) {
        return (
            <div className="p-6 text-center space-y-5 my-auto">
                <div className="w-16 h-16 rounded-full bg-[#EDFAF2] text-[#1E9444] flex items-center justify-center mx-auto border-2 border-[#1E9444]">
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>
                <div>
                    <h2 className="text-[22px] font-bold text-[#1E2328]">Payment Secured in Escrow!</h2>
                    <p className="text-[13px] text-[#5A6270] mt-1 max-w-xs mx-auto leading-relaxed">
                        Your payment of <strong>{formatETB(totalAmount)}</strong> has been locked in Chapa Escrow.
                        The farmer has been notified to dispatch your produce.
                    </p>
                </div>

                <div className="bg-[#FFF8EC] border border-[#FFE5A5] rounded-xl p-3.5 text-left text-[12px] space-y-1">
                    <span className="font-bold text-[#D88C0A] block flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Next Steps:
                    </span>
                    <p className="text-[#5A6270]">
                        Track your delivery on the Orders page. Funds will remain safely locked until you confirm
                        receipt of goods.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/buyer/orders')}
                    className="w-full py-3 rounded-full bg-[#1E9444] text-white font-bold text-[14px] shadow-md hover:bg-[#0F5C2A] transition-colors"
                >
                    View My Orders
                </button>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col min-h-full pb-8">
            {/* Top bar: back arrow + "Secure checkout" */}
            <div className="px-4 py-3 bg-white border-b border-[#E2E4E7] flex items-center gap-3 sticky top-14 z-30">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F0F1F2] transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-[#1E2328]" />
                </button>
                <h2 className="text-[17px] font-bold text-[#1E2328]">Secure checkout</h2>
            </div>

            <div className="p-4">
                {/* Main White Card */}
                <div className="bg-white border border-[#E2E4E7] rounded-xl p-5 shadow-xs space-y-5">
                    {/* Order Summary Row */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#F0F1F2] flex items-center justify-center text-2xl shrink-0">
                            {listing.cropEmoji}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-[15px] font-bold text-[#1E2328] truncate">{listing.cropName}</h4>
                            <p className="text-[12px] text-[#5A6270]">
                                {quantityKg.toLocaleString()} kg @ {formatETB(listing.pricePerKg)}/kg
                            </p>
                        </div>
                    </div>

                    <hr className="border-[#E2E4E7]" />

                    {/* Large centered amount display */}
                    <div className="text-center py-2">
                        <span className="text-[13px] font-medium text-[#5A6270] block">Total to escrow</span>
                        <span className="text-[32px] font-extrabold text-[#1E2328] mt-0.5 block leading-tight">
                            {formatETB(totalAmount)}
                        </span>
                    </div>

                    {/* Chapa Logo Row */}
                    <div className="bg-[#F8F9FA] border border-[#E2E4E7] rounded-xl p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#1E9444] text-white flex items-center justify-center font-black text-xl shadow-xs">
                                C
                            </div>
                            <div>
                                <h5 className="text-[14px] font-bold text-[#1E2328] leading-tight">Pay via Chapa</h5>
                                <span className="text-[11px] text-[#5A6270]">Secure Ethiopian Payment</span>
                            </div>
                        </div>
                        <span className="text-[11px] font-semibold text-[#5A6270]">Telebirr · CBE · Banks</span>
                    </div>

                    {/* Escrow Info Box */}
                    <div className="bg-[#EDFAF2] border border-[#C3EFCF] rounded-xl p-3.5 flex items-start gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-[#1E9444] shrink-0 mt-0.5" />
                        <p className="text-[12px] text-[#0F5C2A] leading-relaxed font-medium">
                            Funds are held in escrow. Released only after delivery confirmed.
                        </p>
                    </div>

                    {/* Itemized Totals */}
                    <div className="space-y-2 text-[13px] pt-1">
                        <div className="flex justify-between text-[#5A6270]">
                            <span>Produce Subtotal ({quantityKg.toLocaleString()} kg)</span>
                            <span>{formatETB(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-[#5A6270]">
                            <span>Platform Escrow Fee</span>
                            <span className="text-[#1E9444] font-semibold">Free</span>
                        </div>
                        <div className="flex justify-between font-bold text-[#1E2328] text-[15px] pt-2 border-t border-[#E2E4E7]">
                            <span>Total</span>
                            <span className="text-[#1E9444]">{formatETB(totalAmount)}</span>
                        </div>
                    </div>

                    {/* Confirm & Pay Button */}
                    <button
                        onClick={handleConfirmPay}
                        disabled={isProcessing}
                        className="w-full py-3.5 rounded-full bg-[#1E9444] text-white font-bold text-[15px] shadow-md hover:bg-[#0F5C2A] transition-all disabled:opacity-50 btn-hover"
                    >
                        {isProcessing ? 'Connecting to Chapa Escrow…' : 'Confirm & pay into escrow'}
                    </button>
                </div>
            </div>
        </div>
    );
};
