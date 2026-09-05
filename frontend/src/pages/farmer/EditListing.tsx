import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useListings } from '@/hooks/useListings';

export const EditListing: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getListingById } = useListings();

    const listing = getListingById(id || '');

    const [pricePerKg, setPricePerKg] = useState<number>(listing ? listing.pricePerKg : 85);
    const [availableQty, setAvailableQty] = useState<number>(listing ? listing.availableQty : 5000);
    const [description, setDescription] = useState<string>(listing ? listing.description : '');
    const [isSaving, setIsSaving] = useState(false);

    if (!listing) {
        return (
            <div className="p-8 text-center">
                <h3 className="text-lg font-bold">Listing not found</h3>
                <button
                    onClick={() => navigate('/farmer/listings')}
                    className="mt-4 px-4 py-2 bg-[#1E9444] text-white rounded-full text-sm font-semibold"
                >
                    Back to My Listings
                </button>
            </div>
        );
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            listing.pricePerKg = pricePerKg;
            listing.availableQty = availableQty;
            listing.description = description;
            setIsSaving(false);
            navigate('/farmer/listings');
        }, 600);
    };

    return (
        <div className="w-full flex flex-col min-h-full bg-white pb-20">
            <div className="px-4 py-3 bg-white border-b border-[#E2E4E7] flex items-center gap-3 sticky top-14 z-30">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F0F1F2] transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-[#1E2328]" />
                </button>
                <h2 className="text-[17px] font-bold text-[#1E2328]">Edit Listing: {listing.cropName}</h2>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-5">
                <div className="bg-[#F8F9FA] p-3.5 rounded-xl border border-[#E2E4E7] flex items-center gap-3">
                    <span className="text-3xl">{listing.cropEmoji}</span>
                    <div>
                        <h3 className="text-[15px] font-bold text-[#1E2328]">{listing.cropName}</h3>
                        <p className="text-[12px] text-[#5A6270]">
                            {listing.region} · {listing.grade}
                        </p>
                    </div>
                </div>

                <div>
                    <label className="text-[12px] font-bold text-[#1E2328] block mb-1">
                        Price per kg (ETB)
                    </label>
                    <input
                        type="number"
                        value={pricePerKg}
                        onChange={(e) => setPricePerKg(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[15px] font-bold text-[#1E9444] focus:outline-none focus:border-[#1E9444]"
                    />
                </div>

                <div>
                    <label className="text-[12px] font-bold text-[#1E2328] block mb-1">
                        Available Quantity (kg)
                    </label>
                    <input
                        type="number"
                        value={availableQty}
                        onChange={(e) => setAvailableQty(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[14px] focus:outline-none focus:border-[#1E9444]"
                    />
                </div>

                <div>
                    <label className="text-[12px] font-bold text-[#1E2328] block mb-1">
                        Description
                    </label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3.5 rounded-full bg-[#1E9444] text-white font-bold text-[15px] shadow-md hover:bg-[#0F5C2A] flex items-center justify-center gap-2 btn-hover"
                >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving changes...' : 'Save changes'}</span>
                </button>
            </form>
        </div>
    );
};
