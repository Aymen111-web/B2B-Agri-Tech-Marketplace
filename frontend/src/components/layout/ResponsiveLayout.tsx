import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    Menu,
    X,
    LogOut,
    User,
    ArrowLeftRight,
    ChevronDown,
    ChevronRight,
    Settings,
    ShieldCheck,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { QelemMedaLogo } from '@/components/common/QelemMedaLogo';

export interface NavItem {
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    category?: string;
    badge?: string;
}

interface ResponsiveLayoutProps {
    portalName?: string;
    portalEmoji?: string;
    portalBadge?: string;
    navItems: NavItem[];
    theme?: 'light' | 'farmerDark';
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
    navItems,
    theme = 'light',
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        user,
        logout,
        hasFarmerCapability,
        hasBuyerCapability,
        switchRole,
        pendingApplications
    } = useAuth();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const isFarmerTheme = theme === 'farmerDark';

    // Close profile dropdown menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsProfileMenuOpen(false);
        logout();
        navigate('/login');
    };

    const getRoleTitle = () => {
        if (user?.role === 'admin') return 'Platform Administrator';
        if (user?.role === 'farmer') return 'Farmer Producer';
        if (user?.role === 'buyer') return 'Commercial Buyer';
        return 'Marketplace Member';
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white text-[#1E2328] rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-[#1E9444]" />
                                <h3 className="text-lg font-bold">Account Settings</h3>
                            </div>
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="p-3 bg-[#F8F9FA] rounded-xl space-y-1">
                                <span className="font-bold block text-[#1E2328]">Profile Name</span>
                                <span className="text-[#5A6270]">{user?.name || 'User'}</span>
                            </div>

                            <div className="p-3 bg-[#F8F9FA] rounded-xl space-y-1">
                                <span className="font-bold block text-[#1E2328]">Phone Number</span>
                                <span className="text-[#5A6270]">{user?.phone || 'Not provided'}</span>
                            </div>

                            <div className="p-3 bg-[#F8F9FA] rounded-xl flex items-center justify-between">
                                <div>
                                    <span className="font-bold block text-[#1E2328]">SMS Verification Notifications</span>
                                    <span className="text-[#5A6270]">Receive Ethiopia SMS alerts for orders</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Enabled</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsSettingsOpen(false)}
                            className="w-full py-2.5 rounded-xl bg-[#1E9444] text-white font-bold text-xs hover:bg-[#0F5C2A]"
                        >
                            Save & Close Settings
                        </button>
                    </div>
                </div>
            )}

            {/* Top Navigation Header */}
            <header
                className={`sticky top-0 z-40 px-4 py-3 border-b flex items-center justify-between shadow-xs transition-colors ${isFarmerTheme
                    ? 'bg-[#062E15] text-white border-[#1E9444]/30'
                    : 'bg-white/95 backdrop-blur-md text-[#1E2328] border-[#E2E4E7]'
                    }`}
            >
                <div className="flex items-center gap-3">
                    {/* Desktop 3-Line Hamburger Menu Icon */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        aria-label="Toggle Side Navigation"
                        className={`hidden md:flex items-center justify-center p-2 rounded-lg transition-colors ${isFarmerTheme
                            ? 'hover:bg-[#0F5C2A] text-white'
                            : 'hover:bg-[#F0F1F2] text-[#1E2328]'
                            }`}
                    >
                        {isSidebarOpen ? (
                            <X className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                            <Menu className="w-5 h-5 stroke-[2.5]" />
                        )}
                    </button>

                    {/* Logo Only */}
                    <div
                        onClick={() => navigate(user?.role === 'farmer' ? '/farmer' : '/buyer')}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <QelemMedaLogo size={34} className="shrink-0" />
                    </div>
                </div>

                {/* Right Top Header Info: Interactive Profile Dropdown Trigger */}
                <div className="flex items-center gap-3 relative" ref={dropdownRef}>
                    {/* Role Switcher Pill if Dual Capabilities */}
                    {hasFarmerCapability && hasBuyerCapability && (
                        <button
                            onClick={() => {
                                const nextRole = user?.role === 'farmer' ? 'buyer' : 'farmer';
                                switchRole(nextRole);
                                navigate(nextRole === 'farmer' ? '/farmer' : '/buyer');
                            }}
                            title="Quick Switch View"
                            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all border shadow-xs ${isFarmerTheme
                                ? 'bg-[#1E9444] text-white border-[#52B870] hover:bg-[#1E9444]/80'
                                : 'bg-[#EDFAF2] text-[#0F5C2A] border-[#C3EFCF] hover:bg-[#D8F6E0]'
                                }`}
                        >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                            <span>Switch to {user?.role === 'farmer' ? 'Buyer View' : 'Farmer View'}</span>
                        </button>
                    )}

                    {/* PROFILE TRIGGER (Image 2 Style) */}
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className={`flex items-center gap-3 px-3 py-1.5 rounded-2xl border transition-all duration-200 shadow-xs cursor-pointer ${isFarmerTheme
                            ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-[#1E2328]'
                            }`}
                    >
                        {/* User Avatar Circle */}
                        <div className="w-8 h-8 rounded-full bg-[#1E9444] text-white flex items-center justify-center text-xs font-extrabold shadow-sm border border-white/30 shrink-0">
                            {user?.name?.[0] || 'U'}
                        </div>

                        {/* Name & Role Text Stack */}
                        <div className="text-left leading-tight hidden sm:block">
                            <span className="text-[13px] font-extrabold block tracking-tight">
                                {user?.name || 'User'}
                            </span>
                            <span
                                className={`text-[10px] font-semibold block capitalize ${isFarmerTheme ? 'text-[#C3EFCF]' : 'text-[#5A6270]'
                                    }`}
                            >
                                {getRoleTitle()}
                            </span>
                        </div>

                        {/* Animated Dropdown Chevron */}
                        <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isProfileMenuOpen ? 'rotate-180 text-[#1E9444]' : 'opacity-70'
                                }`}
                        />
                    </button>

                    {/* INTERACTIVE DROPDOWN POPOVER CARD */}
                    {isProfileMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#E2E4E7] shadow-2xl rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-[#1E2328]">
                            {/* Small Arrow indicator at top right */}
                            <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white border-t border-l border-[#E2E4E7] rotate-45" />

                            {/* Dropdown Header Info Box */}
                            <div className="p-3 bg-gradient-to-r from-[#EDFAF2] to-emerald-50 rounded-xl mb-1.5 border border-[#C3EFCF]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full bg-[#1E9444] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                                        {user?.name?.[0] || 'U'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="text-xs font-extrabold text-[#0F5C2A] truncate">
                                            {user?.name || 'User'}
                                        </h4>
                                        <p className="text-[10px] text-[#5A6270] truncate">
                                            {user?.phone || user?.email || 'Active Member'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-[#C3EFCF] flex items-center justify-between text-[10px]">
                                    <span className="font-bold text-[#0F5C2A] uppercase">{user?.role} Mode</span>
                                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                                        <CheckCircle2 className="w-3 h-3 text-[#1E9444]" /> Verified
                                    </span>
                                </div>
                            </div>

                            {/* Menu Actions Group */}
                            <div className="space-y-1 text-xs">
                                {/* 1. Profile */}
                                <button
                                    onClick={() => {
                                        setIsProfileMenuOpen(false);
                                        navigate(user?.role === 'farmer' ? '/farmer/profile' : '/buyer/profile');
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F0F1F2] transition-colors font-bold text-[#1E2328]"
                                >
                                    <User className="w-4 h-4 text-[#1E9444]" />
                                    <span>Profile</span>
                                </button>

                                {/* 2. DYNAMIC CAPABILITY ITEM: "Switch Capability" if 2 roles, "Update Capability" if 1 role */}
                                {hasFarmerCapability && hasBuyerCapability ? (
                                    <button
                                        onClick={() => {
                                            setIsProfileMenuOpen(false);
                                            const nextRole = user?.role === 'farmer' ? 'buyer' : 'farmer';
                                            switchRole(nextRole);
                                            navigate(nextRole === 'farmer' ? '/farmer' : '/buyer');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#EDFAF2] transition-colors font-bold text-[#0F5C2A]"
                                    >
                                        <ArrowLeftRight className="w-4 h-4 text-[#1E9444]" />
                                        <div className="text-left flex-1 flex items-center justify-between">
                                            <span>Switch Capability</span>
                                            <span className="px-1.5 py-0.5 bg-[#1E9444] text-white rounded-md text-[9px] font-extrabold capitalize">
                                                {user?.role === 'farmer' ? 'Buyer' : 'Farmer'}
                                            </span>
                                        </div>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setIsProfileMenuOpen(false);
                                            navigate('/apply');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F0F1F2] transition-colors font-bold text-[#1E2328]"
                                    >
                                        <ShieldCheck className="w-4 h-4 text-[#1E9444]" />
                                        <div className="text-left flex-1 flex items-center justify-between">
                                            <span>Update Capability</span>
                                            {pendingApplications.length > 0 && (
                                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[9px] font-extrabold">Pending</span>
                                            )}
                                        </div>
                                    </button>
                                )}

                                <div className="border-t border-gray-100 my-1" />

                                {/* 4. Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors font-bold"
                                >
                                    <LogOut className="w-4 h-4 text-red-600" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 flex relative">
                {/* Desktop Collapsible Side Navigation Bar (Refactored to match reference screenshot UX layout) */}
                <aside
                    className={`hidden md:flex flex-col border-r fixed inset-y-0 left-0 pt-16 z-30 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'
                        } ${isFarmerTheme
                            ? 'bg-[#062E15] border-[#1E9444]/30 text-white'
                            : 'bg-white border-[#E2E4E7] text-[#1E2328]'
                        }`}
                >
                    <nav className="p-3 flex-1 space-y-1.5 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                                item.path === navItems[0].path
                                    ? location.pathname === item.path
                                    : location.pathname.startsWith(item.path);

                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    title={!isSidebarOpen ? item.label : undefined}
                                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-[14px] font-semibold transition-all group ${isActive
                                        ? isFarmerTheme
                                            ? 'bg-[#1E9444] text-white shadow-xs font-bold'
                                            : 'bg-[#EDFAF2] text-[#1E9444] shadow-2xs font-bold'
                                        : isFarmerTheme
                                            ? 'text-[#C3EFCF] hover:bg-[#0F5C2A] hover:text-white'
                                            : 'text-[#1E2328] hover:bg-[#F0F1F2]'
                                        } ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Icon
                                            className={`w-4 h-4 shrink-0 ${isActive
                                                ? isFarmerTheme
                                                    ? 'text-white'
                                                    : 'text-[#1E9444]'
                                                : 'text-[#5A6270] group-hover:text-[#1E2328]'
                                                }`}
                                        />
                                        {isSidebarOpen && (
                                            <span className="truncate">{item.label}</span>
                                        )}
                                    </div>

                                    {/* Right Chevron indicator (matching reference screenshot UX) */}
                                    {isSidebarOpen && (
                                        <ChevronRight
                                            className={`w-3.5 h-3.5 shrink-0 ${isActive
                                                ? isFarmerTheme
                                                    ? 'text-white'
                                                    : 'text-[#1E9444]'
                                                : 'text-gray-400 opacity-60 group-hover:opacity-100'
                                                }`}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Bottom Sidebar Info Card */}
                    {isSidebarOpen && (
                        <div className="p-3 border-t border-gray-200/50 m-3 rounded-xl bg-gray-50/60 text-xs">
                            <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-[#1E9444]" />
                                <span className="font-bold text-[#1E2328] capitalize">
                                    {user?.role} Mode Active
                                </span>
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content Area */}
                <main
                    className={`flex-1 w-full pb-20 md:pb-8 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
                        }`}
                >
                    <div className="max-w-7xl mx-auto p-4 md:p-6">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation Bar (< md screens) */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E4E7] py-2 px-4 flex items-center justify-around md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                        item.path === navItems[0].path
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path);

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center gap-0.5 text-center min-w-[56px] py-1 transition-colors ${isActive ? 'text-[#1E9444]' : 'text-[#9BA1AA] hover:text-[#5A6270]'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                            <span className={`text-[11px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div >
    );
};
