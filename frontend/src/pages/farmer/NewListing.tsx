import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Sparkles } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { CropCategory, CropGrade, Farmer } from '@/types';
import { formatETB } from '@/lib/utils';

export const NewListing: React.FC = () => {
    const navigate = useNavigate();
    const { addListing } = useListings();
    const { user } = useAuth();
    const farmer = user as Farmer;

    const [cropName, setCropName] = useState('');
    const [category, setCategory] = useState<CropCategory>('coffee');
    const [grade, setGrade] = useState<CropGrade>('Grade 1');
    const [processMethod, setProcessMethod] = useState('Washed');
    const [region, setRegion] = useState('SNNPR');
    const [zone, setZone] = useState('Sidama');

    const [availableQty, setAvailableQty] = useState<number>(5000);
    const [minOrderQty, setMinOrderQty] = useState<number>(500);
    const [pricePerKg, setPricePerKg] = useState<number>(85);

    const [harvestDate, setHarvestDate] = useState('2024-02-15');
    const [moistureContent, setMoistureContent] = useState<number>(11.0);
    const [description, setDescription] = useState('');

    const [photos, setPhotos] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categoryEmojis: Record<CropCategory, string> = {
        coffee: '☕',
        grains: '🌾',
        spices: '🌿',
        oilseeds: '🥜',
        pulses: '🫘',
        roots: '🧅',
        fruits: '🍋',
        vegetables: '🥬',
    };

    const potentialRevenue = (availableQty || 0) * (pricePerKg || 0);

    const handleUploadPhoto = () => {
        // Add demo photo thumbnail
        setPhotos((prev) => [...prev, 'uploaded-photo-preview']);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            addListing({
                farmerId: farmer.id,
                farmer: farmer,
                cropName: cropName || 'Sidama Coffee Special Batch',
                cropEmoji: categoryEmojis[category] || '☕',
                category,
                grade,
                region,
                zone,
                process: processMethod,
                pricePerKg: pricePerKg || 85,
                availableQty: availableQty || 5000,
                minOrderQty: minOrderQty || 500,
                harvestDate: new Date(harvestDate),
                moistureContent: moistureContent || 11.0,
                description: description || 'Highland Ethiopian farm direct produce harvest.',
                images: photos,
                isActive: true,
                isVerified: true,
            });

            setIsSubmitting(false);
            navigate('/farmer/listings');
        }, 800);
    };

    return (
        <div className="w-full flex flex-col min-h-full bg-white pb-24">
            {/* Top Bar */}
            <div className="px-4 py-3 bg-white border-b border-[#E2E4E7] flex items-center gap-3 sticky top-14 z-30">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F0F1F2] transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-[#1E2328]" />
                </button>
                <h2 className="text-[17px] font-bold text-[#1E2328]">Post a new listing</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-6">
                {/* Section: Crop details */}
                <div className="space-y-4">
                    <h3 className="text-[15px] font-bold text-[#1E2328] border-b border-[#E2E4E7] pb-2">
                        Crop details
                    </h3>

                    <div>
                        <label className="text-[12px] font-bold text-[#1E2328] block mb-1">
                            Crop Name
                        </label>
                        <input
                            type="text"
                            required
                            value={cropName}
                            onChange={(e) => setCropName(e.target.value)}
                            placeholder="e.g. Sidama Washed Coffee G1"
                            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[14px] focus:outline-none focus:border-[#1E9444]"
                        />
                    </div>

                    <div>
                        <label className="text-[12px] font-bold text-[#1E2328] block mb-1">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as CropCategory)}
                            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[14px] focus:outline-none focus:border-[#1E9444]"
                        >
                            <option value="coffee">☕ Coffee</option>
                            <option value="grains">🌾 Grains</option>
                            <option value="spices">🌿 Spices</option>
                            <option value="oilseeds">🥜 Oilseeds</option>
                            <option value="pulses">🫘 Pulses</option>
                            <option value="roots">🧅 Roots</option>
                            <option value="fruits">🍋 Fruits</option>
                            <option value="vegetables">🥬 Vegetables</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[12px] font-bold text-[#1E2328] block mb-1">Grade</label>
                            <select
                                value={grade}
                                onChange={(e) => setGrade(e.target.value as CropGrade)}
                                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]"
                            >
                                <option value="Grade 1">Grade 1</option>
                                <option value="Grade 2">Grade 2</option>
                                <option value="Export Quality">Export Quality</option>
                                <option value="Premium">Premium</option>
                                <option value="Standard">Standard</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[12px] font-bold text-[#1E2328] block mb-1">
                                Process Method
                            </label>
                            <select
                                value={processMethod}
                                onChange={(e) => setProcessMethod(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]"
                            >
                                <option value="Washed">Washed</option>
                                <option value="Natural">Natural</option>
                                <option value="Honey">Honey</option>
                                <option value="N/A">N/A</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[12px] font-bold text-[#1E2328] block mb-1">Region</label>
                            <select
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]"
                            >
                                <option value="SNNPR">SNNPR</option>
                                <option value="Oromia">Oromia</option>
                                <option value="Amhara">Amhara</option>
                                <option value="Tigray">Tigray</option>
                                <option value="Harari">Harari</option>
                                <option value="Sidama">Sidama</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[12px] font-bold text-[#1E2328] block mb-1">Zone</label>
                            <input
                                type="text"
                                value={zone}
                                onChange={(e) => setZone(e.target.value)}
                                placeholder="e.g. Sidama / Bale"
                                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]"
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Quantity & pricing */}
                <div className="space-y-4">
                    <h3 className="text-[15px] font-bold text-[#1E2328] border-b border-[#E2E4E7] pb-2">
                        Quantity & pricing
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[12px] font-bold text-[#1E2328] block mb-1">
                                Available Qty (kg)
                            </label>
                            <input
                                type="number"
                                required
                                value={availableQty}
                                onChange={(e) => setAvailableQty(Number(e.target.value))}
                                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[14px] focus:outline-none focus:border-[#1E9444]"
                            />
                        </div>

                        <div>
                            <label className="text-[12px] font-bold text-[#1E2328] block mb-1">
                                Min Order (kg)
                            </label>
                            <input
                                type="number"
                                required
                                value={minOrderQty}
                                onChange={(e) => setMinOrderQty(Number(e.target.value))}
                                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[14px] focus:outline-none focus:border-[#1E9444]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[12px] font-bold text-[#1E2328] block mb-1">
                            Price per kg (ETB)
                        </label>
                        <input
                            type="number"
                            required
                            value={pricePerKg}
                            onChange={(e) => setPricePerKg(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[14px] font-bold text-[#1E9444] focus:outline-none focus:border-[#1E9444]"
                        />
                        {/* Live revenue preview */}
                        <div className="mt-2 p-2.5 bg-[#EDFAF2] border border-[#C3EFCF] rounded-lg flex items-center justify-between text-[12px]">
                            <span className="text-[#0F5C2A] font-semibold flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-[#1E9444]" /> Potential revenue preview:
                            </span>
                            <strong className="text-[#1E9444] text-[14px] font-extrabold">
                                {formatETB(potentialRevenue)}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* Section: Quality details */}
                <div className="space-y-4">
                    <h3 className="text-[15px] font-bold text-[#1E2328] border-b border-[#E2E4E7] pb-2">
                        Quality details
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[12px] font-bold text-[#1E2328] block mb-1">
                                Harvest Date
                            </label>
                            <input
                                type="date"
                                value={harvestDate}
                                onChange={(e) => setHarvestDate(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]"
                            />
                        </div>

                        <div>
                            <label className="text-[12px] font-bold text-[#1E2328] block mb-1">
                                Moisture % (optional)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={moistureContent}
                                onChange={(e) => setMoistureContent(Number(e.target.value))}
                                placeholder="11.0"
                                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#1E9444]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[12px] font-bold text-[#1E2328] block mb-1">
                            Produce Description
                        </label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your crop's origin, cupping/baking notes, packaging format..."
                            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E7] rounded-xl text-[13px] min-h-[120px] focus:outline-none focus:border-[#1E9444]"
                        />
                    </div>
                </div>

                {/* Section: Photos */}
                <div className="space-y-3">
                    <h3 className="text-[15px] font-bold text-[#1E2328] border-b border-[#E2E4E7] pb-2">
                        Photos
                    </h3>

                    <div
                        onClick={handleUploadPhoto}
                        className="border-2 border-dashed border-[#E2E4E7] rounded-xl p-6 text-center cursor-pointer hover:border-[#1E9444] transition-colors bg-[#F8F9FA]"
                    >
                        <Camera className="w-8 h-8 text-[#9BA1AA] mx-auto mb-2" />
                        <span className="text-[13px] font-bold text-[#1E9444] block">Tap to upload produce photos</span>
                        <span className="text-[11px] text-[#5A6270]">PNG, JPG up to 10MB</span>
                    </div>

                    {photos.length > 0 && (
                        <div className="flex gap-2">
                            {photos.map((_, i) => (
                                <div
                                    key={i}
                                    className="w-16 h-16 rounded-lg bg-[#1E9444]/10 border border-[#1E9444] flex items-center justify-center text-[#1E9444] text-[11px] font-bold"
                                >
                                    Photo #{i + 1}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sticky bottom bar */}
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E4E7] p-4 max-w-[480px] md:max-w-4xl mx-auto shadow-md">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-full bg-[#1E9444] text-white font-bold text-[15px] shadow-md hover:bg-[#0F5C2A] transition-all btn-hover"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit for review'}
                    </button>
                    <p className="text-[11px] text-[#5A6270] text-center mt-1.5 font-medium">
                        An admin will verify and publish within 24h
                    </p>
                </div>
            </form>
        </div>
    );
};
