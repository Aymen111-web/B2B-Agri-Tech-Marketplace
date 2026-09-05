import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Camera,
    CheckCircle2,
    ArrowLeftRight,
    X,
    Phone,
    BadgeCheck,
    MapPin,
    Warehouse,
    Edit3,
    Check,
    Shield,
    User,
    Building2,
    Calendar,
    TrendingUp,
    Globe,
    Award
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Buyer } from '@/types';

export const BuyerProfile: React.FC = () => {
    const navigate = useNavigate();
    const { user, switchRole, hasFarmerCapability } = useAuth();
    const buyer = user as Buyer;

    // Display Identity State
    const [fullName, setFullName] = useState(buyer?.name || 'Aymen Buyer');
    const [companyName, setCompanyName] = useState(buyer?.companyName || 'Addis Enterprise Supply Ltd.');
    const [phone, setPhone] = useState(buyer?.phone || '+251 911 234 567');
    const [region, setRegion] = useState('Addis Ababa, Ethiopia');
    const [warehouseAddress, setWarehouseAddress] = useState('Kality Industrial Zone, Warehouse B4, Addis Ababa');

    // Modal Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [modalFullName, setModalFullName] = useState(fullName);
    const [modalCompanyName, setModalCompanyName] = useState(companyName);
    const [modalPhone, setModalPhone] = useState(phone);
    const [modalRegion, setModalRegion] = useState(region);
    const [modalWarehouse, setModalWarehouse] = useState(warehouseAddress);

    // Toast Notice
    const [toastMsg, setToastMsg] = useState('');

    const openEditModal = () => {
        setModalFullName(fullName);
        setModalCompanyName(companyName);
        setModalPhone(phone);
        setModalRegion(region);
        setModalWarehouse(warehouseAddress);
        setIsEditModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFullName(modalFullName);
        setCompanyName(modalCompanyName);
        setPhone(modalPhone);
        setRegion(modalRegion);
        setWarehouseAddress(modalWarehouse);
        setIsEditModalOpen(false);

        setToastMsg('Buyer profile updated successfully');
        setTimeout(() => setToastMsg(''), 3000);
    };

    const getInitials = (nameStr: string) => {
        const parts = nameStr.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return (nameStr[0] || 'A').toUpperCase();
    };

    return (
        <div className="w-full min-h-screen bg-[#F0F2F5] text-[#1E2328] font-sans pb-20 animate-fade-in -mx-4 -mt-6 sm:-mx-6 sm:-mt-8 p-4 sm:p-6 max-w-4xl mx-auto">

            {/* LIGHT TOP HEADER BAR */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-3xl shadow-xs">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/buyer')}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                        title="Back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-sm font-black text-[#1E2328] tracking-wide">Buyer Profile</h2>
                        <span className="text-[11px] text-[#1E9444] font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1E9444] animate-pulse" />
                            online • Verified Commercial Buyer
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {hasFarmerCapability && (
                        <button
                            type="button"
                            onClick={() => switchRole('farmer')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E9444] border border-emerald-200 text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                            <span>Farmer Mode</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={openEditModal}
                        className="p-2 rounded-full hover:bg-gray-100 text-[#0B57D0] transition-colors cursor-pointer"
                        title="Edit Profile"
                    >
                        <Edit3 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* LIGHT TOAST NOTICE */}
            {toastMsg && (
                <div className="mt-3 px-4 py-2.5 bg-emerald-50 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs border border-emerald-200 animate-fade-in">
                    <Check className="w-4 h-4 text-[#1E9444]" />
                    <span>{toastMsg}</span>
                </div>
            )}

            {/* LIGHT PROFILE HERO (AVATAR & MAIN TITLE) */}
            <div className="bg-white rounded-b-3xl p-6 sm:p-8 flex flex-col items-center text-center relative border-b border-gray-200 shadow-xs space-y-3">
                <div className="relative group">
                    {/* Circular Avatar */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#1E9444] via-emerald-600 to-[#0B57D0] p-1 shadow-md">
                        <div className="w-full h-full rounded-full bg-[#1E2328] flex items-center justify-center text-white text-3xl font-black tracking-wider">
                            {getInitials(fullName)}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => alert('Change profile photo')}
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#1E9444] hover:bg-[#0F5C2A] text-white flex items-center justify-center border-2 border-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                        title="Change Photo"
                    >
                        <Camera className="w-4 h-4" />
                    </button>
                </div>

                <div>
                    <div className="flex items-center justify-center gap-1.5">
                        <h1 className="text-xl sm:text-2xl font-black text-[#1E2328] tracking-tight">
                            {fullName}
                        </h1>
                        <BadgeCheck className="w-5 h-5 text-[#1E9444]" />
                    </div>
                    <p className="text-xs text-[#5A6270] font-bold mt-0.5">
                        {companyName}
                    </p>
                </div>

                <div className="flex items-center gap-2 pt-1 flex-wrap justify-center text-xs">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#1E9444] border border-emerald-200 font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1E9444]" /> Verified Buyer
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-[#D88C0A] border border-amber-200 font-extrabold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#D88C0A]" /> 3 Years on Platform
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0B57D0] border border-blue-200 font-extrabold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-[#0B57D0]" /> ETB 400M Spend
                    </span>
                </div>
            </div>

            {/* LIGHT GROUPED PROFILE CARDS */}
            <div className="mt-4 space-y-3">

                {/* GROUP 1: BUYER INFORMATION */}
                <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs">
                    <div className="px-4 py-2.5 text-[11px] font-extrabold text-[#0B57D0] uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                        Buyer Details
                    </div>

                    <div className="divide-y divide-gray-100">

                        {/* Row: Full Name */}
                        <div className="px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                            <div className="flex items-center gap-3.5">
                                <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B57D0] flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-xs font-black text-[#1E2328] block">{fullName}</span>
                                    <span className="text-[11px] text-[#5A6270] font-medium">Full Name</span>
                                </div>
                            </div>
                        </div>

                        {/* Row: Company Name */}
                        <div className="px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                            <div className="flex items-center gap-3.5">
                                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#1E9444] flex items-center justify-center shrink-0">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-xs font-black text-[#1E2328] block">{companyName}</span>
                                    <span className="text-[11px] text-[#5A6270] font-medium">Company Name</span>
                                </div>
                            </div>
                        </div>

                        {/* Row: Phone Number */}
                        <div className="px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3.5">
                                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#1E9444] flex items-center justify-center shrink-0">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-xs font-black text-[#1E2328] block">{phone}</span>
                                    <span className="text-[11px] text-[#5A6270] font-medium">Phone Number</span>
                                </div>
                            </div>
                        </div>

                        {/* Row: Region */}
                        <div className="px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                            <div className="flex items-center gap-3.5">
                                <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B57D0] flex items-center justify-center shrink-0">
                                    <Globe className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-xs font-black text-[#1E2328] block">{region}</span>
                                    <span className="text-[11px] text-[#5A6270] font-medium">Region / Operating Territory</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* GROUP 2: PLATFORM TRUST & PROCUREMENT VOLUME */}
                <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs">
                    <div className="px-4 py-2.5 text-[11px] font-extrabold text-[#D88C0A] uppercase tracking-wider bg-gray-50 border-b border-gray-100 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-[#D88C0A]" /> Platform Trust & Trade Metrics
                    </div>

                    <div className="divide-y divide-gray-100">
                        {/* Row: 3 Years on Platform */}
                        <div className="px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                            <div className="flex items-center gap-3.5">
                                <div className="w-9 h-9 rounded-full bg-amber-50 text-[#D88C0A] flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-xs font-black text-[#1E2328] block">3 Years on this Platform</span>
                                    <span className="text-[11px] text-[#5A6270] font-medium">Active Verified Buyer since 2023 (High Trust Rating)</span>
                                </div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-[#D88C0A] text-[10px] font-extrabold border border-amber-200">
                                TRUSTED
                            </span>
                        </div>

                        {/* Row: Spent 400M Birr */}
                        <div className="px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                            <div className="flex items-center gap-3.5">
                                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#1E9444] flex items-center justify-center shrink-0">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-xs font-black text-[#1E9444] block">ETB 400,000,000 Birr</span>
                                    <span className="text-[11px] text-[#5A6270] font-medium">Total Procurement Spend Transacted via Escrow</span>
                                </div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-[#1E9444] text-[10px] font-extrabold border border-emerald-200">
                                VIP VOLUME
                            </span>
                        </div>
                    </div>
                </div>

                {/* GROUP 3: LOGISTICS & WAREHOUSE HUB */}
                <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs">
                    <div className="px-4 py-2.5 text-[11px] font-extrabold text-[#0B57D0] uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                        Delivery & Warehouse Hub
                    </div>

                    <div className="divide-y divide-gray-100">
                        <div className="px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                            <div className="flex items-start gap-3.5">
                                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#1E9444] flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-xs font-black text-[#1E2328] block">{warehouseAddress}</span>
                                    <span className="text-[11px] text-[#5A6270] font-medium">Primary Delivery Destination</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                            <div className="flex items-center gap-3.5">
                                <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B57D0] flex items-center justify-center shrink-0">
                                    <Warehouse className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-xs font-black text-[#1E2328] block">Dawit Haile (Logistics Manager)</span>
                                    <span className="text-[11px] text-[#5A6270] font-medium">Receiving Manager • Cold Storage Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* LIGHT MODAL DIALOG: EDIT BUYER PROFILE */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-[#1E2328] relative">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#1E9444] text-white flex items-center justify-center shrink-0">
                                    <Edit3 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-[#1E2328]">Edit Buyer Profile</h3>
                                    <p className="text-[11px] text-[#5A6270]">Update buyer information & details</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
                            <div className="space-y-1">
                                <label className="text-[#1E2328] font-bold">Full Name</label>
                                <input
                                    type="text"
                                    value={modalFullName}
                                    onChange={(e) => setModalFullName(e.target.value)}
                                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-[#1E2328] font-bold focus:outline-none focus:border-[#1E9444]"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[#1E2328] font-bold">Company Name</label>
                                <input
                                    type="text"
                                    value={modalCompanyName}
                                    onChange={(e) => setModalCompanyName(e.target.value)}
                                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-[#1E2328] font-bold focus:outline-none focus:border-[#1E9444]"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[#1E2328] font-bold">Phone Number</label>
                                <input
                                    type="text"
                                    value={modalPhone}
                                    onChange={(e) => setModalPhone(e.target.value)}
                                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-[#1E2328] font-bold focus:outline-none focus:border-[#1E9444]"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[#1E2328] font-bold">Region</label>
                                <input
                                    type="text"
                                    value={modalRegion}
                                    onChange={(e) => setModalRegion(e.target.value)}
                                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-[#1E2328] font-bold focus:outline-none focus:border-[#1E9444]"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[#1E2328] font-bold">Delivery Warehouse Destination</label>
                                <input
                                    type="text"
                                    value={modalWarehouse}
                                    onChange={(e) => setModalWarehouse(e.target.value)}
                                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-[#1E2328] font-bold focus:outline-none focus:border-[#1E9444]"
                                    required
                                />
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white font-bold cursor-pointer shadow-xs"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
