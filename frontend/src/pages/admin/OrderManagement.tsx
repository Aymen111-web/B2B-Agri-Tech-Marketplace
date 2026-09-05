import React from 'react';
import { useOrders } from '@/hooks/useOrders';
import { formatETB } from '@/lib/utils';

export const OrderManagement: React.FC = () => {
    const { orders } = useOrders();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-[24px] font-bold text-[#1E2328]">Order Management</h1>
                <p className="text-[13px] text-[#5A6270]">Monitor active escrow transactions</p>
            </div>

            <div className="bg-white border border-[#E2E4E7] rounded-xl shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#F8F9FA] border-b border-[#E2E4E7] text-[12px] font-bold text-[#5A6270]">
                            <th className="py-3 px-4">Order Ref</th>
                            <th className="py-3 px-4">Buyer</th>
                            <th className="py-3 px-4">Farmer</th>
                            <th className="py-3 px-4">Total ETB</th>
                            <th className="py-3 px-4">Escrow Status</th>
                            <th className="py-3 px-4">Order Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E4E7] text-[13px]">
                        {orders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-[#F8F9FA]">
                                <td className="py-3.5 px-4 font-bold text-[#1E2328]">{ord.id}</td>
                                <td className="py-3.5 px-4 text-[#5A6270]">{ord.buyer.name}</td>
                                <td className="py-3.5 px-4 text-[#5A6270]">{ord.farmer.name}</td>
                                <td className="py-3.5 px-4 font-bold text-[#1E9444]">
                                    {formatETB(ord.totalAmountETB)}
                                </td>
                                <td className="py-3.5 px-4">
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF8EC] text-[#D88C0A]">
                                        {ord.escrowStatus.toUpperCase()}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 capitalize text-[#5A6270]">
                                    {ord.status.replace('_', ' ')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
