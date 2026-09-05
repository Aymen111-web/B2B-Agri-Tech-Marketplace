import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileCheck,
    ListOrdered,
    ShoppingBag,
    DollarSign,
} from 'lucide-react';
import { formatETB, formatDate } from '@/lib/utils';
import { useOrders } from '@/hooks/useOrders';
import { useListings } from '@/hooks/useListings';

interface ApplicationRow {
    id: string;
    name: string;
    role: 'farmer' | 'buyer';
    region: string;
    submittedAt: Date;
    documents: string[];
    status: 'pending' | 'approved' | 'rejected';
}

const INITIAL_APPLICATIONS: ApplicationRow[] = [
    {
        id: 'app-101',
        name: 'Kassa Tsegaye',
        role: 'farmer',
        region: 'Amhara',
        submittedAt: new Date('2024-03-01'),
        documents: ['land_cert_01.pdf', 'id_card.png'],
        status: 'pending',
    },
    {
        id: 'app-102',
        name: 'Nile Food Processors PLC',
        role: 'buyer',
        region: 'Addis Ababa',
        submittedAt: new Date('2024-03-02'),
        documents: ['trade_license_2024.pdf', 'tin_cert.pdf'],
        status: 'pending',
    },
    {
        id: 'app-103',
        name: 'Mulugeta Worku',
        role: 'farmer',
        region: 'Oromia',
        submittedAt: new Date('2024-03-03'),
        documents: ['farm_title.pdf'],
        status: 'pending',
    },
];

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { orders } = useOrders();
    const { listings } = useListings();

    const [applications, setApplications] = useState<ApplicationRow[]>(INITIAL_APPLICATIONS);

    const handleApprove = (id: string) => {
        setApplications((prev) =>
            prev.map((app) => (app.id === id ? { ...app, status: 'approved' } : app))
        );
    };

    const handleReject = (id: string) => {
        setApplications((prev) =>
            prev.map((app) => (app.id === id ? { ...app, status: 'rejected' } : app))
        );
    };

    const pendingApps = applications.filter((app) => app.status === 'pending');
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmountETB, 0);

    return (
        <div className="space-y-8">
            {/* Top Header */}
            <div>
                <h1 className="text-[24px] font-bold text-[#1E2328]">Admin Dashboard</h1>
                <p className="text-[13px] text-[#5A6270]">
                    Overview of AgriMarket platform operations, verification queue, and escrow statistics.
                </p>
            </div>

            {/* Metrics row (4 cards, equal width) */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white border border-[#E2E4E7] rounded-xl p-5 shadow-xs">
                    <div className="flex items-center justify-between text-[#5A6270]">
                        <span className="text-[13px] font-bold">Pending Applications</span>
                        <FileCheck className="w-5 h-5 text-[#D88C0A]" />
                    </div>
                    <span className="text-[28px] font-extrabold text-[#1E2328] mt-2 block">
                        {pendingApps.length}
                    </span>
                </div>

                <div className="bg-white border border-[#E2E4E7] rounded-xl p-5 shadow-xs">
                    <div className="flex items-center justify-between text-[#5A6270]">
                        <span className="text-[13px] font-bold">Active Listings</span>
                        <ListOrdered className="w-5 h-5 text-[#1E9444]" />
                    </div>
                    <span className="text-[28px] font-extrabold text-[#1E2328] mt-2 block">
                        {listings.length}
                    </span>
                </div>

                <div className="bg-white border border-[#E2E4E7] rounded-xl p-5 shadow-xs">
                    <div className="flex items-center justify-between text-[#5A6270]">
                        <span className="text-[13px] font-bold">Orders This Month</span>
                        <ShoppingBag className="w-5 h-5 text-[#1E9444]" />
                    </div>
                    <span className="text-[28px] font-extrabold text-[#1E2328] mt-2 block">
                        {orders.length + 12}
                    </span>
                </div>

                <div className="bg-white border border-[#E2E4E7] rounded-xl p-5 shadow-xs">
                    <div className="flex items-center justify-between text-[#5A6270]">
                        <span className="text-[13px] font-bold">Revenue Facilitated</span>
                        <DollarSign className="w-5 h-5 text-[#F5B73A]" />
                    </div>
                    <span className="text-[22px] font-extrabold text-[#1E9444] mt-2 block">
                        {formatETB(totalRevenue + 4500000)}
                    </span>
                </div>
            </div>

            {/* Applications Queue Table */}
            <div className="bg-white border border-[#E2E4E7] rounded-xl shadow-xs overflow-hidden">
                <div className="p-5 border-b border-[#E2E4E7] flex items-center justify-between">
                    <h2 className="text-[16px] font-bold text-[#1E2328]">Applications Review Queue</h2>
                    <button
                        onClick={() => navigate('/admin/applications')}
                        className="text-[12px] font-bold text-[#1E9444] hover:underline"
                    >
                        View full panel
                    </button>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#F8F9FA] border-b border-[#E2E4E7] text-[12px] font-bold text-[#5A6270]">
                            <th className="py-3 px-4">Applicant Name</th>
                            <th className="py-3 px-4">Requested Role</th>
                            <th className="py-3 px-4">Region</th>
                            <th className="py-3 px-4">Submitted</th>
                            <th className="py-3 px-4">Documents</th>
                            <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E4E7] text-[13px]">
                        {applications.map((app) => (
                            <tr key={app.id} className="hover:bg-[#F8F9FA] transition-colors">
                                <td className="py-3.5 px-4 font-bold text-[#1E2328]">{app.name}</td>
                                <td className="py-3.5 px-4">
                                    <span
                                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${app.role === 'farmer'
                                            ? 'bg-[#EDFAF2] text-[#0F5C2A]'
                                            : 'bg-blue-50 text-blue-700'
                                            }`}
                                    >
                                        {app.role}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 text-[#5A6270]">{app.region}</td>
                                <td className="py-3.5 px-4 text-[#5A6270]">{formatDate(app.submittedAt)}</td>
                                <td className="py-3.5 px-4 font-semibold text-[#1E9444]">
                                    {app.documents.length} files attached
                                </td>
                                <td className="py-3.5 px-4 text-right space-x-2">
                                    {app.status === 'pending' ? (
                                        <>
                                            <button
                                                onClick={() => handleApprove(app.id)}
                                                className="px-3 py-1.5 rounded-lg bg-[#1E9444] text-white font-bold text-[12px] hover:bg-[#0F5C2A]"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(app.id)}
                                                className="px-3 py-1.5 rounded-lg border border-red-500 text-red-600 font-bold text-[12px] hover:bg-red-50"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <span
                                            className={`text-[12px] font-bold capitalize ${app.status === 'approved' ? 'text-[#1E9444]' : 'text-red-600'
                                                }`}
                                        >
                                            {app.status}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white border border-[#E2E4E7] rounded-xl shadow-xs overflow-hidden">
                <div className="p-5 border-b border-[#E2E4E7]">
                    <h2 className="text-[16px] font-bold text-[#1E2328]">Recent Marketplace Orders</h2>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#F8F9FA] border-b border-[#E2E4E7] text-[12px] font-bold text-[#5A6270]">
                            <th className="py-3 px-4">Order ID</th>
                            <th className="py-3 px-4">Buyer</th>
                            <th className="py-3 px-4">Farmer</th>
                            <th className="py-3 px-4">Crop</th>
                            <th className="py-3 px-4">Amount</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E4E7] text-[13px]">
                        {orders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-[#F8F9FA] transition-colors">
                                <td className="py-3.5 px-4 font-bold text-[#1E2328]">{ord.id}</td>
                                <td className="py-3.5 px-4 text-[#5A6270]">
                                    {ord.buyer.companyName || ord.buyer.name}
                                </td>
                                <td className="py-3.5 px-4 text-[#5A6270]">{ord.farmer.name}</td>
                                <td className="py-3.5 px-4 font-bold text-[#1E2328]">{ord.listing.cropName}</td>
                                <td className="py-3.5 px-4 font-bold text-[#1E9444]">
                                    {formatETB(ord.totalAmountETB)}
                                </td>
                                <td className="py-3.5 px-4">
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EDFAF2] text-[#0F5C2A] capitalize">
                                        {ord.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 text-[#5A6270]">{formatDate(ord.placedAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
