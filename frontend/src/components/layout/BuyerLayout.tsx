import React from 'react';
import { Home, Store, ShoppingCart, User as UserIcon } from 'lucide-react';
import { ResponsiveLayout, NavItem } from './ResponsiveLayout';

const buyerNavItems: NavItem[] = [
    { path: '/buyer', label: 'Dashboard', icon: Home },
    { path: '/buyer/marketplace', label: 'Marketplace', icon: Store },
    { path: '/buyer/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/buyer/profile', label: 'Profile', icon: UserIcon },
];

export const BuyerLayout: React.FC = () => {
    return (
        <ResponsiveLayout
            navItems={buyerNavItems}
            theme="light"
        />
    );
};
