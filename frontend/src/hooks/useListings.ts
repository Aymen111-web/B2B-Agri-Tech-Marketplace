import { useState, useEffect, useCallback } from 'react';
import { Listing, CropCategory } from '@/types';
import { api, getAuthToken } from '@/services/api';

const INITIAL_LISTINGS: Listing[] = [
    {
        id: 'listing-1',
        farmerId: 'farmer-1',
        farmer: {
            id: 'farmer-1',
            name: 'Dawit Bekele',
            email: 'dawit@sidamafarm.et',
            phone: '+251 912 345 678',
            role: 'farmer',
            status: 'verified',
            region: 'SNNPR',
            farmSize: 14.5,
            totalEarned: 890000,
            rating: 4.9,
            reviewCount: 38,
            crops: ['Coffee', 'Teff'],
            createdAt: new Date('2023-11-10'),
        },
        cropName: 'Sidama Washed Coffee G1',
        cropEmoji: '☕',
        category: 'coffee',
        grade: 'Grade 1',
        region: 'SNNPR',
        zone: 'Sidama',
        process: 'Washed',
        pricePerKg: 85,
        availableQty: 12000,
        minOrderQty: 500,
        harvestDate: new Date('2024-02-10'),
        moistureContent: 11.2,
        description: 'Highland washed specialty grade 1 coffee from Hawassa zuriya. Bright acidity, jasmine aroma, and clean citrus notes.',
        images: [],
        isActive: true,
        isVerified: true,
        createdAt: new Date('2024-02-15'),
        viewCount: 342,
    },
    {
        id: 'listing-2',
        farmerId: 'farmer-2',
        farmer: {
            id: 'farmer-2',
            name: 'Lemlem Haile',
            email: 'lemlem@tigraysesame.et',
            phone: '+251 914 567 890',
            role: 'farmer',
            status: 'verified',
            region: 'Tigray',
            farmSize: 22.0,
            totalEarned: 1420000,
            rating: 4.8,
            reviewCount: 29,
            crops: ['Sesame'],
            createdAt: new Date('2023-09-01'),
        },
        cropName: 'Humera White Sesame',
        cropEmoji: '🌱',
        category: 'oilseeds',
        grade: 'Export Quality',
        region: 'Tigray',
        zone: 'Humera',
        process: 'Sun-dried',
        pricePerKg: 62,
        availableQty: 30000,
        minOrderQty: 1000,
        harvestDate: new Date('2024-01-20'),
        moistureContent: 6.5,
        description: 'Premium white Humera type sesame seed. High oil content (54%), clean machine-hulled ready for export.',
        images: [],
        isActive: true,
        isVerified: true,
        createdAt: new Date('2024-01-25'),
        viewCount: 512,
    },
    {
        id: 'listing-3',
        farmerId: 'farmer-3',
        farmer: {
            id: 'farmer-3',
            name: 'Abebe Girma',
            email: 'abebe@balegrains.et',
            phone: '+251 911 876 543',
            role: 'farmer',
            status: 'verified',
            region: 'Oromia',
            farmSize: 45.0,
            totalEarned: 2150000,
            rating: 4.7,
            reviewCount: 44,
            crops: ['Wheat', 'Barley'],
            createdAt: new Date('2023-05-12'),
        },
        cropName: 'Bale Durum Wheat',
        cropEmoji: '🌾',
        category: 'grains',
        grade: 'Grade A',
        region: 'Oromia',
        zone: 'Bale',
        process: 'Combine Harvested',
        pricePerKg: 28,
        availableQty: 55000,
        minOrderQty: 2000,
        harvestDate: new Date('2024-01-10'),
        moistureContent: 12.0,
        description: 'High-gluten durum wheat ideal for pasta and flour milling. Cleaned and stone-separated batch.',
        images: [],
        isActive: true,
        isVerified: true,
        createdAt: new Date('2024-01-15'),
        viewCount: 420,
    },
    {
        id: 'listing-4',
        farmerId: 'farmer-4',
        farmer: {
            id: 'farmer-4',
            name: 'Tigist Alemu',
            email: 'tigist@amharaspices.et',
            phone: '+251 918 234 111',
            role: 'farmer',
            status: 'verified',
            region: 'Amhara',
            farmSize: 8.0,
            totalEarned: 640000,
            rating: 5.0,
            reviewCount: 52,
            crops: ['Chili', 'Ginger'],
            createdAt: new Date('2023-10-05'),
        },
        cropName: 'Berbere Chili Blend',
        cropEmoji: '🌶️',
        category: 'spices',
        grade: 'Premium',
        region: 'Amhara',
        zone: 'Mareko',
        process: 'Natural Sun-dried',
        pricePerKg: 110,
        availableQty: 8000,
        minOrderQty: 100,
        harvestDate: new Date('2024-02-01'),
        moistureContent: 9.0,
        description: 'Pungent Mareko Fana red peppers. Deep crimson red color, high capsaicin content for spice processing.',
        images: [],
        isActive: true,
        isVerified: true,
        createdAt: new Date('2024-02-05'),
        viewCount: 680,
    },
];

function mapRawListingToFrontend(item: any): Listing {
    return {
        id: String(item.id),
        farmerId: String(item.farmer_id || item.farmerId || 'farmer-1'),
        farmer: item.farmer ? {
            id: String(item.farmer.id || 'farmer-1'),
            name: `${item.farmer.first_name || ''} ${item.farmer.second_name || ''}`.trim() || item.farmer.name || 'Dawit Bekele',
            email: item.farmer.email || 'farmer@agri.et',
            phone: item.farmer.phone || '+251 912 345 678',
            role: 'farmer',
            status: 'verified',
            region: item.farmer.region || 'SNNPR',
            farmSize: 14.5,
            totalEarned: 890000,
            rating: 4.9,
            reviewCount: 38,
            crops: ['Coffee', 'Teff'],
            createdAt: new Date(),
        } : INITIAL_LISTINGS[0].farmer,
        cropName: item.title || item.cropName || 'Produce',
        cropEmoji: item.crop_emoji || item.cropEmoji || '🌾',
        category: (item.category?.slug || item.category || 'grains') as CropCategory,
        grade: item.grade || 'Grade 1',
        region: item.region || 'Sidama',
        zone: item.zone || 'Zone 1',
        process: item.process || 'Sun-dried',
        pricePerKg: Number(item.price_per_unit || item.pricePerKg || 50),
        availableQty: Number(item.quantity_available || item.availableQty || 1000),
        minOrderQty: Number(item.min_order_qty || item.minOrderQty || 100),
        harvestDate: item.harvest_date ? new Date(item.harvest_date) : new Date(),
        description: item.description || '',
        images: item.image_path ? [`http://127.0.0.1:8000/storage/${item.image_path}`] : (item.images || []),
        isActive: item.status === 'active' || item.isActive !== false,
        isVerified: true,
        createdAt: item.created_at ? new Date(item.created_at) : new Date(),
        viewCount: item.view_count || item.viewCount || 1,
    };
}

export function useListings() {
    const [listings, setListings] = useState<Listing[]>(() => {
        const saved = localStorage.getItem('agri_listings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return parsed.map((item: any) => ({
                    ...item,
                    harvestDate: new Date(item.harvestDate),
                    createdAt: new Date(item.createdAt),
                }));
            } catch (e) { }
        }
        return INITIAL_LISTINGS;
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const refreshListings = useCallback(async () => {
        const token = getAuthToken();
        if (!token) return;

        setIsLoading(true);
        try {
            const res = await api.fetchMyListings();
            const rawItems = Array.isArray(res) ? res : (res?.data || []);
            if (rawItems.length > 0) {
                const mapped = rawItems.map(mapRawListingToFrontend);
                setListings(mapped);
            }
        } catch {
            // Keep current local/cached listings if API fails
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshListings();
    }, [refreshListings]);

    useEffect(() => {
        localStorage.setItem('agri_listings', JSON.stringify(listings));
    }, [listings]);

    const addListing = async (newListingData: Omit<Listing, 'id' | 'createdAt' | 'viewCount'>) => {
        const token = getAuthToken();
        let created: Listing;

        if (token) {
            try {
                const res = await api.createListing({
                    title: newListingData.cropName,
                    description: newListingData.description,
                    unit: 'kg',
                    price_per_unit: newListingData.pricePerKg,
                    quantity_available: newListingData.availableQty,
                });
                if (res?.listing) {
                    created = mapRawListingToFrontend(res.listing);
                    setListings((prev) => [created, ...prev]);
                    return created;
                }
            } catch {
                // Fallback to local creation if backend offline
            }
        }

        created = {
            ...newListingData,
            id: `listing-${Date.now()}`,
            createdAt: new Date(),
            viewCount: 1,
        };
        setListings((prev) => [created, ...prev]);
        return created;
    };

    const getListingById = (id: string) => {
        return listings.find((item) => item.id === id);
    };

    const filterListings = (category?: CropCategory | 'all', query?: string) => {
        return listings.filter((item) => {
            const matchCat = !category || category === 'all' || item.category === category;
            const matchQuery =
                !query ||
                item.cropName.toLowerCase().includes(query.toLowerCase()) ||
                item.region.toLowerCase().includes(query.toLowerCase()) ||
                item.farmer?.name?.toLowerCase().includes(query.toLowerCase()) ||
                item.grade.toLowerCase().includes(query.toLowerCase());
            return matchCat && matchQuery;
        });
    };

    return {
        listings,
        isLoading,
        refreshListings,
        addListing,
        getListingById,
        filterListings,
    };
}
