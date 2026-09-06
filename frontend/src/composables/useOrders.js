import { ref, onMounted, watch } from 'vue'
import { api, getAuthToken } from '@/services/api'

const INITIAL_ORDERS = [
    {
        id: 'ORD-8921', listingId: 'listing-1',
        listing: { id: 'listing-1', farmerId: 'farmer-1', farmer: { id: 'farmer-1', name: 'Dawit Bekele', email: 'dawit@sidamafarm.et', phone: '+251 912 345 678', role: 'farmer', status: 'verified', region: 'SNNPR', farmSize: 14.5, totalEarned: 890000, rating: 4.9, reviewCount: 38, crops: ['Coffee', 'Teff'], createdAt: new Date('2023-11-10') }, cropName: 'Sidama Washed Coffee G1', cropEmoji: '☕', category: 'coffee', grade: 'Grade 1', region: 'SNNPR', zone: 'Sidama', pricePerKg: 85, availableQty: 12000, minOrderQty: 500, harvestDate: new Date('2024-02-10'), description: '', images: [], isActive: true, isVerified: true, createdAt: new Date('2024-02-15'), viewCount: 342 },
        buyerId: 'buyer-1',
        buyer: { id: 'buyer-1', name: 'Alemayehu Tadesse', email: 'buyer@addissupply.et', phone: '+251 911 234 567', role: 'buyer', status: 'verified', region: 'Addis Ababa', companyName: 'Addis Supply Co.', businessType: 'wholesaler', totalOrdered: 340000, createdAt: new Date('2024-01-15') },
        farmerId: 'farmer-1',
        farmer: { id: 'farmer-1', name: 'Dawit Bekele', email: 'dawit@sidamafarm.et', phone: '+251 912 345 678', role: 'farmer', status: 'verified', region: 'SNNPR', farmSize: 14.5, totalEarned: 890000, rating: 4.9, reviewCount: 38, crops: ['Coffee'], createdAt: new Date('2023-11-10') },
        quantityKg: 2000, totalAmountETB: 170000, status: 'in_transit', escrowStatus: 'held', escrowReference: 'CHP-TX-88901234',
        placedAt: new Date('2024-02-28T10:30:00'), dispatchedAt: new Date('2024-03-01T14:15:00'),
        trackingNotes: [
            { id: 't-1', orderId: 'ORD-8921', status: 'placed', note: 'Order placed & funds locked in Chapa Escrow', timestamp: new Date('2024-02-28T10:30:00'), actorRole: 'buyer' },
            { id: 't-2', orderId: 'ORD-8921', status: 'dispatched', note: 'Loaded on truck heading to Addis Ababa', timestamp: new Date('2024-03-01T14:15:00'), actorRole: 'farmer' },
        ],
    },
    {
        id: 'ORD-8919', listingId: 'listing-3',
        listing: { id: 'listing-3', farmerId: 'farmer-3', farmer: { id: 'farmer-3', name: 'Abebe Girma', email: 'abebe@balegrains.et', phone: '+251 911 876 543', role: 'farmer', status: 'verified', region: 'Oromia', farmSize: 45.0, totalEarned: 2150000, rating: 4.7, reviewCount: 44, crops: ['Wheat'], createdAt: new Date('2023-05-12') }, cropName: 'Bale Durum Wheat', cropEmoji: '🌾', category: 'grains', grade: 'Grade A', region: 'Oromia', zone: 'Bale', pricePerKg: 28, availableQty: 55000, minOrderQty: 2000, harvestDate: new Date('2024-01-10'), description: '', images: [], isActive: true, isVerified: true, createdAt: new Date('2024-01-15'), viewCount: 420 },
        buyerId: 'buyer-1',
        buyer: { id: 'buyer-1', name: 'Alemayehu Tadesse', email: 'buyer@addissupply.et', phone: '+251 911 234 567', role: 'buyer', status: 'verified', region: 'Addis Ababa', companyName: 'Addis Supply Co.', businessType: 'wholesaler', totalOrdered: 340000, createdAt: new Date('2024-01-15') },
        farmerId: 'farmer-3',
        farmer: { id: 'farmer-3', name: 'Abebe Girma', email: 'abebe@balegrains.et', phone: '+251 911 876 543', role: 'farmer', status: 'verified', region: 'Oromia', farmSize: 45.0, totalEarned: 2150000, rating: 4.7, reviewCount: 44, crops: ['Wheat'], createdAt: new Date('2023-05-12') },
        quantityKg: 5000, totalAmountETB: 140000, status: 'completed', escrowStatus: 'released', escrowReference: 'CHP-TX-77610092',
        placedAt: new Date('2024-02-10T09:00:00'), dispatchedAt: new Date('2024-02-12T11:00:00'), deliveredAt: new Date('2024-02-14T16:20:00'), completedAt: new Date('2024-02-14T16:25:00'),
        trackingNotes: [
            { id: 't-3', orderId: 'ORD-8919', status: 'delivered', note: 'Buyer confirmed receipt. Escrow funds released.', timestamp: new Date('2024-02-14T16:25:00'), actorRole: 'buyer' },
        ],
    },
]

function mapRawOrderToFrontend(item) {
    const isEscrowReleased = item.escrow_status === 'released' || item.escrowStatus === 'released'
    return {
        id: String(item.id || item.order_number || 'ORD-8921'),
        listingId: String(item.listing_id || item.listingId || 'listing-1'),
        listing: item.listing ? {
            id: String(item.listing.id || 'listing-1'),
            farmerId: String(item.listing.farmer_id || 'farmer-1'),
            farmer: INITIAL_ORDERS[0].farmer,
            cropName: item.listing.title || 'Produce Batch',
            cropEmoji: item.listing.crop_emoji || '🌾',
            category: item.listing.category?.slug || 'grains',
            grade: item.listing.grade || 'Grade 1',
            region: item.listing.region || 'Sidama',
            zone: item.listing.zone || 'Hawassa',
            pricePerKg: Number(item.listing.price_per_unit || 50),
            availableQty: Number(item.listing.quantity_available || 1000),
            minOrderQty: 100, harvestDate: new Date(), description: '', images: [],
            isActive: true, isVerified: true, createdAt: new Date(), viewCount: 100,
        } : INITIAL_ORDERS[0].listing,
        buyerId: String(item.buyer_id || item.buyerId || 'buyer-1'),
        buyer: item.buyer ? {
            id: String(item.buyer.id || 'buyer-1'),
            name: `${item.buyer.first_name || ''} ${item.buyer.second_name || ''}`.trim() || item.buyer.name || 'Addis Exporters',
            email: item.buyer.email || 'buyer@agri.et',
            phone: item.buyer.phone || '',
            role: 'buyer', status: 'verified', region: item.buyer.region || 'Addis Ababa',
            companyName: item.buyer.company_name || 'Addis Supply Co.', businessType: 'wholesaler', totalOrdered: 340000, createdAt: new Date(),
        } : INITIAL_ORDERS[0].buyer,
        farmerId: String(item.farmer_id || item.farmerId || 'farmer-1'),
        farmer: INITIAL_ORDERS[0].farmer,
        quantityKg: Number(item.quantity_kg || item.quantityKg || 1000),
        totalAmountETB: Number(item.total_amount_etb || item.totalAmountETB || 50000),
        status: item.status || 'placed',
        escrowStatus: isEscrowReleased ? 'released' : 'held',
        escrowReference: item.escrow_reference || item.escrowReference || `CHP-TX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        placedAt: item.created_at ? new Date(item.created_at) : new Date(),
        trackingNotes: [],
    }
}

export function useOrders() {
    const orders = ref([])

    // Load from localStorage
    const saved = localStorage.getItem('agri_orders')
    if (saved) {
        try {
            const parsed = JSON.parse(saved)
            orders.value = parsed.map((item) => ({
                ...item,
                placedAt: new Date(item.placedAt),
                dispatchedAt: item.dispatchedAt ? new Date(item.dispatchedAt) : undefined,
                deliveredAt: item.deliveredAt ? new Date(item.deliveredAt) : undefined,
                completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
            }))
        } catch {
            orders.value = [...INITIAL_ORDERS]
        }
    } else {
        orders.value = [...INITIAL_ORDERS]
    }

    const refreshOrders = async () => {
        const token = getAuthToken()
        if (!token) return

        try {
            const res = await api.fetchMyFulfillments()
            const rawItems = Array.isArray(res) ? res : (res?.data || [])
            if (rawItems.length > 0) {
                orders.value = rawItems.map(mapRawOrderToFrontend)
            }
        } catch {
            // offline fallback
        }
    }

    watch(orders, (val) => {
        localStorage.setItem('agri_orders', JSON.stringify(val))
    }, { deep: true })

    onMounted(() => {
        refreshOrders()
    })

    const placeOrder = (listing, buyer, quantityKg) => {
        const totalAmountETB = listing.pricePerKg * quantityKg
        const newOrder = {
            id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
            listingId: listing.id,
            listing,
            buyerId: buyer.id,
            buyer,
            farmerId: listing.farmerId,
            farmer: listing.farmer,
            quantityKg,
            totalAmountETB,
            status: 'placed',
            escrowStatus: 'held',
            escrowReference: `CHP-TX-${Math.floor(10000000 + Math.random() * 90000000)}`,
            placedAt: new Date(),
            trackingNotes: [
                {
                    id: `note-${Date.now()}`,
                    orderId: 'ORD-TEMP',
                    status: 'placed',
                    note: 'Order created and payment secured in Chapa escrow',
                    timestamp: new Date(),
                    actorRole: 'buyer',
                },
            ],
        }
        orders.value = [newOrder, ...orders.value]
        return newOrder
    }

    const confirmDelivery = (orderId) => {
        orders.value = orders.value.map((order) => {
            if (order.id === orderId) {
                const now = new Date()
                return {
                    ...order,
                    status: 'delivered',
                    escrowStatus: 'released',
                    deliveredAt: now,
                    completedAt: now,
                    trackingNotes: [
                        ...order.trackingNotes,
                        {
                            id: `note-${Date.now()}`,
                            orderId,
                            status: 'delivered',
                            note: 'Delivery confirmed by buyer. Chapa escrow funds released to farmer.',
                            timestamp: now,
                            actorRole: 'buyer',
                        },
                    ],
                }
            }
            return order
        })
    }

    const updateOrderStatus = async (orderId, status, note) => {
        const token = getAuthToken()
        if (token) {
            try {
                const statusAction = status === 'completed' || status === 'delivered' ? 'complete' : 'accept'
                await api.updateFulfillmentStatus(orderId, statusAction, note)
            } catch {
                // offline fallback
            }
        }

        orders.value = orders.value.map((order) => {
            if (order.id === orderId) {
                const now = new Date()
                return {
                    ...order,
                    status,
                    dispatchedAt: status === 'dispatched' ? now : order.dispatchedAt,
                    trackingNotes: [
                        ...order.trackingNotes,
                        {
                            id: `note-${Date.now()}`,
                            orderId,
                            status,
                            note,
                            timestamp: now,
                            actorRole: 'farmer',
                        },
                    ],
                }
            }
            return order
        })
    }

    return {
        orders,
        refreshOrders,
        placeOrder,
        confirmDelivery,
        updateOrderStatus,
    }
}
