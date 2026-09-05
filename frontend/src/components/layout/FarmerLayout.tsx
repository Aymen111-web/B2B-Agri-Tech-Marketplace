import React from 'react';
import { Home, Package, ShoppingCart, Wallet } from 'lucide-react';
import { ResponsiveLayout, NavItem } from './ResponsiveLayout';

const farmerNavItems: NavItem[] = [
    { path: '/farmer', label: 'Dashboard', icon: Home },
    { path: '/farmer/listings', label: 'My Listings', icon: Package },
    { path: '/farmer/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/farmer/payouts', label: 'Payouts Hub', icon: Wallet },
];

export const FarmerLayout: React.FC = () => {
    return (
        <ResponsiveLayout
            navItems={farmerNavItems}
            theme="farmerDark"
        />
    );
};
