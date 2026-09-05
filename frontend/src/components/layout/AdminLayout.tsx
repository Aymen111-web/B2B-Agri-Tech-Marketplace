import React from 'react';
import {
    Home,
    FileText,
    Package,
    ShoppingCart,
    Shield,
    Users,
} from 'lucide-react';
import { ResponsiveLayout, NavItem } from './ResponsiveLayout';

const adminNavItems: NavItem[] = [
    { path: '/admin', label: 'Dashboard', icon: Home },
    { path: '/admin/applications', label: 'Applications', icon: FileText },
    { path: '/admin/listings', label: 'Listings', icon: Package },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/admin/disputes', label: 'Disputes', icon: Shield },
    { path: '/admin/users', label: 'Users', icon: Users },
];

export const AdminLayout: React.FC = () => {
    return (
        <ResponsiveLayout
            navItems={adminNavItems}
            theme="light"
        />
    );
};
