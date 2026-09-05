import React from 'react';
import { useListings } from '@/hooks/useListings';
import { formatETB } from '@/lib/utils';


export const ListingModeration: React.FC = () => {
    const { listings } = useListings();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-[24px] font-bold text-[#1E2328]">Listing Moderation</h1>
                <p className="text-[13px] text-[#5A6270]">Review and verify marketplace crop listings</p>
            </div>

            <div className="bg-white border border-[#E2E4E7] rounded-xl shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#F8F9FA] border-b border-[#E2E4E7] text-[12px] font-bold text-[#5A6270]">
                            <th className="py-3 px-4">Crop & Farmer</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Grade</th>
                            <th className="py-3 px-4">Price</th>
                            <th className="py-3 px-4">Available</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E4E7] text-[13px]">
                        {listings.map((item) => (
                            <tr key={item.id} className="hover:bg-[#F8F9FA]">
                                <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-2xl">{item.cropEmoji}</span>
                                        <div>
                                            <h4 className="font-bold text-[#1E2328]">{item.cropName}</h4>
                                            <p className="text-[11px] text-[#5A6270]">
                                                {item.farmer.name} ({item.region})
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3.5 px-4 capitalize text-[#5A6270]">{item.category}</td>
                                <td className="py-3.5 px-4 font-semibold text-[#1E2328]">{item.grade}</td>
                                <td className="py-3.5 px-4 font-bold text-[#1E9444]">
                                    {formatETB(item.pricePerKg)}/kg
                                </td>
                                <td className="py-3.5 px-4 text-[#5A6270]">
                                    {item.availableQty.toLocaleString()} kg
                                </td>
                                <td className="py-3.5 px-4">
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EDFAF2] text-[#0F5C2A]">
                                        Verified
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 text-right space-x-2">
                                    <button className="px-3 py-1 bg-[#1E9444] text-white rounded-lg text-[12px] font-bold">
                                        Verify
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
