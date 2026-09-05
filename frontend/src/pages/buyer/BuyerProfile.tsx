import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    User,
    Eye,
    EyeOff,
    Camera,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    ArrowLeftRight,
    Award,
    X,
    Lock,
    Phone,
    Building2,
    BadgeCheck,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Buyer } from '@/types';

export const BuyerProfile: React.FC = () => {
    const navigate = useNavigate();
    const { user, switchRole, hasFarmerCapability } = useAuth();
    const buyer = user as Buyer;

    // Display Identity State (persisted until updated via modal)
    const [firstName, setFirstName] = useState(buyer?.name?.split(' ')[0] || 'Aymen');
    const [lastName, setLastName] = useState(buyer?.name?.split(' ').slice(1).join(' ') || 'Buyer');
    const [companyName, setCompanyName] = useState(buyer?.companyName || 'Addis Supply Co.');
    const [phone, setPhone] = useState(buyer?.phone || '+251718280155');

    // Security & Name Update Modal State
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
    const [modalCompanyName, setModalCompanyName] = useState(companyName);
    const [modalFirstName, setModalFirstName] = useState(firstName);
    const [modalLastName, setModalLastName] = useState(lastName);
    const [modalPhone, setModalPhone] = useState(phone);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    // Bank Account & Payment System State
    const [paymentProvider, setPaymentProvider] = useState('Commercial Bank of Ethiopia (CBE)');
    const [accountName, setAccountName] = useState(companyName || `${firstName} ${lastName}`);
    const [accountNumber, setAccountNumber] = useState('1000298192819');
    const [bankBranch, setBankBranch] = useState('Addis Ababa Main Branch');

    // Feedback Messages
    const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
    const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

    const openUpdateModal = () => {
        setModalCompanyName(companyName);
        setModalFirstName(firstName);
        setModalLastName(lastName);
        setModalPhone(phone);
        setIsSecurityModalOpen(true);
    };

    const handleProfileSecuritySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCompanyName(modalCompanyName);
        setFirstName(modalFirstName);
        setLastName(modalLastName);
        setPhone(modalPhone);
        setIsSecurityModalOpen(false);

        setProfileSuccessMsg('Buyer profile details & security credentials updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setProfileSuccessMsg(''), 4000);
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPaymentSuccessMsg('Bank account & payment system choice saved successfully!');
        setTimeout(() => setPaymentSuccessMsg(''), 4000);
    };

    const initials = (firstName[0] || 'U') + (lastName[0] || '');

    return (
        <div className="w-full flex flex-col min-h-full pb-12 max-w-5xl mx-auto space-y-6">
            {/* Top Navigation & Breadcrumb Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/buyer')}
                    className="flex items-center gap-1 text-xs font-bold text-[#1E9444] hover:text-[#0F5C2A] transition-colors cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                    <span>Account</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-[#1E9444]">Profile & Settings</span>
                </div>
            </div>

            {/* Title Section */}
            <div>
                <h1 className="text-2xl font-black text-[#1E2328] tracking-tight">Buyer Profile</h1>
                <p className="text-xs text-[#5A6270] mt-0.5 font-medium">
                    Manage corporate details, payment preferences, and security credentials
                </p>
            </div>

            {/* Main 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN: Corporate Identity Card (Redesigned Info Display) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white border border-[#E2E4E7] rounded-3xl overflow-hidden shadow-xs space-y-4">
                        <div className="bg-gradient-to-r from-[#0D1117] via-[#0F2A18] to-[#1E9444] h-28 relative">
                            {hasFarmerCapability && (
                                <button
                                    onClick={() => switchRole('farmer')}
                                    className="absolute top-3 right-3 px-3 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 text-[10px] font-extrabold rounded-full flex items-center gap-1 transition-all cursor-pointer"
                                >
                                    <ArrowLeftRight className="w-3 h-3 text-[#C3EFCF]" />
                                    <span>Switch to Farmer</span>
                                </button>
                            )}
                        </div>

                        {/* Avatar & Corporate Info */}
                        <div className="px-5 pb-5 pt-0 relative">
                            <div className="flex items-end justify-between -mt-12">
                                <div className="relative group">
                                    <div className="w-20 h-20 rounded-2xl bg-[#0D1117] text-white flex items-center justify-center text-2xl font-black shadow-lg border-4 border-white shrink-0">
                                        {initials || 'ZA'}
                                    </div>

                                    {/* Photo Update Camera Button on Avatar */}
                                    <button
                                        type="button"
                                        onClick={() => alert('Company logo / photo picker initialized')}
                                        title="Update Profile Photo"
                                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white border-2 border-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={openUpdateModal}
                                    className="px-3.5 py-1.5 rounded-xl border border-gray-200 bg-[#F8F9FA] hover:bg-gray-100 text-xs font-bold text-[#1E2328] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                    <User className="w-3.5 h-3.5 text-[#1E9444]" />
                                    <span>Edit Profile</span>
                                </button>
                            </div>

                            <div className="mt-3">
                                <h2 className="text-lg font-black text-[#1E2328] tracking-tight">
                                    {companyName}
                                </h2>
                                <p className="text-xs text-[#5A6270] font-medium">Rep: {firstName} {lastName}</p>

                                <div className="mt-2 flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold capitalize">
                                        Commercial Buyer Mode
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1E9444]" /> Business Verified
                                    </span>
                                </div>
                            </div>

                            {/* REDESIGNED INFO DISPLAY LAYOUT (NO EDITING PLACEHOLDER LOOK) */}
                            <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#1E9444] flex items-center justify-center shrink-0">
                                            <Building2 className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-bold text-[#5A6270]">Company Entity</span>
                                    </div>
                                    <span className="text-xs font-black text-[#1E2328]">{companyName}</span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#1E9444] flex items-center justify-center shrink-0">
                                            <User className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-bold text-[#5A6270]">Representative</span>
                                    </div>
                                    <span className="text-xs font-black text-[#1E2328]">{firstName} {lastName}</span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#1E9444] flex items-center justify-center shrink-0">
                                            <Phone className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-bold text-[#5A6270]">Phone Number</span>
                                    </div>
                                    <span className="text-xs font-black text-[#1E2328]">{phone}</span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#1E9444] flex items-center justify-center shrink-0">
                                            <BadgeCheck className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-bold text-[#5A6270]">Tier Status</span>
                                    </div>
                                    <span className="text-xs font-black text-[#0B57D0]">Trade Verified Buyer</span>
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#1E9444] flex items-center justify-center shrink-0">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-bold text-[#5A6270]">Account Security</span>
                                    </div>
                                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Protected</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Capability Status Card */}
                    <div className="bg-white border border-[#E2E4E7] rounded-3xl p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-extrabold text-[#1E2328]">Account Capabilities</h3>
                            {hasFarmerCapability ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">Dual Role Active</span>
                            ) : (
                                <a href="/apply" className="text-xs font-bold text-[#1E9444] hover:underline flex items-center gap-1">
                                    <Award className="w-3.5 h-3.5" /> Upgrade Role
                                </a>
                            )}
                        </div>

                        <div className="p-3 bg-[#EEF2F6] border border-blue-200 rounded-xl flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-[#0B57D0] block">Commercial Buyer Capability</span>
                                <span className="text-[10px] text-[#5A6270]">Trade License & VAT Verified</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-[#0B57D0] text-white text-[10px] font-extrabold">Active</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Account Security Button Card & Bank Payment System */}
                <div className="lg:col-span-7 space-y-6">

                    {/* SECTION 1: Account Security & Profile Details Button Card */}
                    <div className="bg-white border border-[#E2E4E7] rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1E9444] flex items-center justify-center shrink-0 border border-emerald-100">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-[#1E2328]">Account Security & Credentials</h3>
                                    <p className="text-[11px] text-[#5A6270]">Update your company, name, and security password</p>
                                </div>
                            </div>

                            {/* UPDATE BUTTON THAT TRIGGERS POP-UP MODAL */}
                            <button
                                type="button"
                                onClick={openUpdateModal}
                                className="px-4 py-2 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Update Security</span>
                            </button>
                        </div>

                        {profileSuccessMsg && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#1E9444]" />
                                <span>{profileSuccessMsg}</span>
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: BANK ACCOUNT & PAYMENT SYSTEM CHOICE */}
                    <form onSubmit={handlePaymentSubmit} className="bg-white border border-[#E2E4E7] rounded-3xl p-6 shadow-xs space-y-5">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-[#1E2328]">Bank Account & Escrow System</h3>
                                    <p className="text-[11px] text-[#5A6270]">Set up your choice of bank account or payment system for purchase orders</p>
                                </div>
                            </div>
                        </div>

                        {paymentSuccessMsg && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#1E9444]" />
                                <span>{paymentSuccessMsg}</span>
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#1E2328]">Payment System Choice</label>
                                <select
                                    value={paymentProvider}
                                    onChange={(e) => setPaymentProvider(e.target.value)}
                                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1E2328] focus:outline-none focus:border-[#1E9444] transition-colors"
                                >
                                    <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                                    <option value="Telebirr (Ethio Telecom Mobile Money)">Telebirr (Ethio Telecom)</option>
                                    <option value="Dashen Bank / Amole">Dashen Bank / Amole</option>
                                    <option value="Awash International Bank">Awash International Bank</option>
                                    <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#1E2328]">Account Holder Name</label>
                                    <input
                                        type="text"
                                        value={accountName}
                                        onChange={(e) => setAccountName(e.target.value)}
                                        placeholder="Company / Personal Name in Bank"
                                        className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#1E2328] focus:outline-none focus:border-[#1E9444] transition-colors"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#1E2328]">Account Number / Telebirr Phone</label>
                                    <input
                                        type="text"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        placeholder="e.g. 1000298192819"
                                        className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#1E2328] focus:outline-none focus:border-[#1E9444] transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#1E2328]">Bank Branch / Settlement Hub</label>
                                <input
                                    type="text"
                                    value={bankBranch}
                                    onChange={(e) => setBankBranch(e.target.value)}
                                    placeholder="e.g. Addis Ababa Main Branch"
                                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#1E2328] focus:outline-none focus:border-[#1E9444] transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                            >
                                Save Payment System Choice
                            </button>
                        </div>
                    </form>

                </div>

            </div>

            {/* POP-UP MODAL: UPDATE ACCOUNT SECURITY, NAME & PASSWORD */}
            {isSecurityModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white border border-[#E2E4E7] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1E9444] flex items-center justify-center shrink-0">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-[#1E2328]">Update Account & Security</h3>
                                    <p className="text-[11px] text-[#5A6270]">Update company, contact details, and password</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSecurityModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleProfileSecuritySubmit} className="space-y-4">

                            {/* Profile Photo Area inside modal */}
                            <div className="flex items-center gap-4 p-3 bg-[#F8F9FA] rounded-2xl border border-gray-200/60">
                                <div className="w-12 h-12 rounded-xl bg-[#0D1117] text-white flex items-center justify-center text-base font-black shrink-0 border border-white shadow-xs">
                                    {initials || 'ZA'}
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => alert('Company logo / photo selection initialized')}
                                        className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-xs font-bold text-[#1E2328] hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                    >
                                        <Camera className="w-3.5 h-3.5 text-[#1E9444]" />
                                        <span>Change Logo</span>
                                    </button>
                                </div>
                            </div>

                            {/* Company & Name Input Fields inside Modal */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#1E2328]">Company Name</label>
                                <input
                                    type="text"
                                    value={modalCompanyName}
                                    onChange={(e) => setModalCompanyName(e.target.value)}
                                    placeholder="Company Name"
                                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#1E2328] focus:outline-none focus:border-[#1E9444]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#1E2328]">First Name</label>
                                    <input
                                        type="text"
                                        value={modalFirstName}
                                        onChange={(e) => setModalFirstName(e.target.value)}
                                        placeholder="First Name"
                                        className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#1E2328] focus:outline-none focus:border-[#1E9444]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#1E2328]">Last Name</label>
                                    <input
                                        type="text"
                                        value={modalLastName}
                                        onChange={(e) => setModalLastName(e.target.value)}
                                        placeholder="Last Name"
                                        className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#1E2328] focus:outline-none focus:border-[#1E9444]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#1E2328]">Phone Number</label>
                                <input
                                    type="text"
                                    value={modalPhone}
                                    onChange={(e) => setModalPhone(e.target.value)}
                                    placeholder="Phone Number"
                                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#1E2328] focus:outline-none focus:border-[#1E9444]"
                                />
                            </div>

                            {/* Password Section */}
                            <div className="pt-2 border-t border-gray-100 space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#1E2328]">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPw ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter Current Password"
                                            className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#1E2328] focus:outline-none focus:border-[#1E9444] pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPw(!showCurrentPw)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                        >
                                            {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#1E2328]">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPw ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="New Password"
                                                className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-[#1E2328] focus:outline-none focus:border-[#1E9444] pr-8"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPw(!showNewPw)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                            >
                                                {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#1E2328]">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPw ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm Password"
                                                className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-[#1E2328] focus:outline-none focus:border-[#1E9444] pr-8"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPw(!showConfirmPw)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                            >
                                                {showConfirmPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[11px] text-[#5A6270] font-medium flex items-center gap-1 pt-1">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                <span>Leave password fields blank to keep current password.</span>
                            </p>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsSecurityModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-[#1E9444] hover:bg-[#0F5C2A] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                                >
                                    Save Updates
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
