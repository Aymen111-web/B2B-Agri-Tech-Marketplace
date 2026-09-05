import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts & Protection
import { BuyerLayout } from '@/components/layout/BuyerLayout';
import { FarmerLayout } from '@/components/layout/FarmerLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// Buyer Pages
import { Home } from '@/pages/buyer/Home';
import { Marketplace } from '@/pages/buyer/Marketplace';
import { ListingDetail } from '@/pages/buyer/ListingDetail';
import { Checkout } from '@/pages/buyer/Checkout';
import { Orders } from '@/pages/buyer/Orders';
import { BuyerProfile } from '@/pages/buyer/BuyerProfile';

// Farmer Pages
import { Dashboard } from '@/pages/farmer/Dashboard';
import { MyListings } from '@/pages/farmer/MyListings';
import { NewListing } from '@/pages/farmer/NewListing';
import { EditListing } from '@/pages/farmer/EditListing';
import { FarmerOrders } from '@/pages/farmer/FarmerOrders';
import { Payouts } from '@/pages/farmer/Payouts';
import { FarmerProfile } from '@/pages/farmer/FarmerProfile';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { ApplicationReview } from '@/pages/admin/ApplicationReview';
import { ListingModeration } from '@/pages/admin/ListingModeration';
import { OrderManagement } from '@/pages/admin/OrderManagement';
import { DisputeCenter } from '@/pages/admin/DisputeCenter';
import { UserManagement } from '@/pages/admin/UserManagement';

// Auth Pages
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { CapabilityApplication } from '@/pages/auth/CapabilityApplication';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/login" replace />,
    },
    {
        element: <ProtectedRoute allowedRoles={['buyer']} />,
        children: [
            {
                path: '/buyer',
                element: <BuyerLayout />,
                children: [
                    { index: true, element: <Home /> },
                    { path: 'marketplace', element: <Marketplace /> },
                    { path: 'listing/:id', element: <ListingDetail /> },
                    { path: 'checkout/:id', element: <Checkout /> },
                    { path: 'orders', element: <Orders /> },
                    { path: 'profile', element: <BuyerProfile /> },
                ],
            },
        ],
    },
    {
        element: <ProtectedRoute allowedRoles={['farmer']} />,
        children: [
            {
                path: '/farmer',
                element: <FarmerLayout />,
                children: [
                    { index: true, element: <Dashboard /> },
                    { path: 'listings', element: <MyListings /> },
                    { path: 'listings/new', element: <NewListing /> },
                    { path: 'listings/edit/:id', element: <EditListing /> },
                    { path: 'orders', element: <FarmerOrders /> },
                    { path: 'payouts', element: <Payouts /> },
                    { path: 'profile', element: <FarmerProfile /> },
                ],
            },
        ],
    },
    {
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
            {
                path: '/admin',
                element: <AdminLayout />,
                children: [
                    { index: true, element: <AdminDashboard /> },
                    { path: 'applications', element: <ApplicationReview /> },
                    { path: 'listings', element: <ListingModeration /> },
                    { path: 'orders', element: <OrderManagement /> },
                    { path: 'disputes', element: <DisputeCenter /> },
                    { path: 'users', element: <UserManagement /> },
                ],
            },
        ],
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/apply',
        element: <CapabilityApplication />,
    },
    {
        path: '*',
        element: <Navigate to="/login" replace />,
    },
]);
