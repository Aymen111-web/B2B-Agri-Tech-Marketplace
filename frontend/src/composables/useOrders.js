import { ref, onMounted, watch } from 'vue'
import { api, getAuthToken } from '@/services/api'

function getCurrentUserData() {
    try {
        const saved = localStorage.getItem('agri_user_data')
        if (saved) return JSON.parse(saved)
    } catch { /* ignore */ }
    return null
}

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
    const isEscrowReleased = item.escrow_status === 'released' || item.escrowStatus === 'released' || item.payout_status === 'released'

    // Extract first item & listing from items array or fulfillments array or root item
    const firstItem = item.items?.[0] || item.fulfillments?.[0]?.items?.[0] || {}
    const firstListing = firstItem.listing || item.listing || {}
    const farmerObj = firstListing.farmer || item.fulfillments?.[0]?.farmer || item.farmer || {}
    const buyerObj = item.buyer || {}

    const totalAmount = Number(item.total_amount || item.totalAmountETB || item.total_amount_etb || firstItem.subtotal || 0)
    const quantity = Number(firstItem.quantity || item.quantity_kg || item.quantityKg || 0)

    const cropTitle = firstListing.title || firstListing.cropName || item.title || item.cropName || 'Produce Batch'
    const cropEmoji = firstListing.crop_emoji || firstListing.cropEmoji || item.cropEmoji || '🌾'
    const categorySlug = firstListing.category?.slug || firstListing.category || item.category || 'grains'
    const qualityGrade = firstListing.quality_grade || firstListing.grade || item.grade || 'Grade 1'
    const regionName = firstListing.region || farmerObj.region || item.region || 'Sidama'
    const zoneName = firstListing.zone || item.zone || ''

    const farmerName = `${farmerObj.first_name || ''} ${farmerObj.second_name || ''}`.trim() || farmerObj.name || 'Aymen Mohammed'
    const buyerName = `${buyerObj.first_name || ''} ${buyerObj.second_name || ''}`.trim() || buyerObj.name || 'Commercial Buyer'

    const escrowRef = item.payment?.chapa_tx_ref || item.escrow_reference || item.escrowReference || `CHP-TX-${Math.floor(10000000 + Math.random() * 90000000)}`

    return {
        id: String(item.id || item.order_number || `ORD-${Math.floor(1000 + Math.random() * 9000)}`),
        orderNumber: String(item.order_number || item.id || ''),
        listingId: String(firstListing.id || item.listingId || ''),
        listing: {
            id: String(firstListing.id || ''),
            farmerId: String(farmerObj.id || firstListing.farmer_id || ''),
            farmer: {
                id: String(farmerObj.id || ''),
                name: farmerName,
                region: regionName,
                phone: farmerObj.phone || '',
            },
            cropName: cropTitle,
            cropEmoji: cropEmoji,
            category: categorySlug,
            grade: qualityGrade,
            region: regionName,
            zone: zoneName,
            pricePerKg: Number(firstListing.price_per_unit || firstListing.pricePerKg || (quantity > 0 ? totalAmount / quantity : 0)),
            availableQty: Number(firstListing.quantity_available || firstListing.availableQty || 1000),
            minOrderQty: 100, harvestDate: new Date(), description: '', images: [],
            isActive: true, isVerified: true, createdAt: new Date(), viewCount: 100,
        },
        buyerId: String(buyerObj.id || item.buyer_id || item.buyerId || ''),
        buyer: {
            id: String(buyerObj.id || item.buyer_id || ''),
            name: buyerName,
            email: buyerObj.email || '',
            phone: buyerObj.phone || '',
            role: 'buyer', status: 'verified', region: buyerObj.region || 'Addis Ababa',
            companyName: buyerObj.company_name || buyerName, businessType: 'wholesaler', totalOrdered: 0, createdAt: new Date(),
        },
        farmerId: String(farmerObj.id || firstListing.farmer_id || item.farmer_id || ''),
        farmer: {
            id: String(farmerObj.id || ''),
            name: farmerName,
            phone: farmerObj.phone || '',
            region: regionName,
        },
        quantityKg: quantity,
        totalAmountETB: totalAmount,
        status: item.status || 'placed',
        escrowStatus: isEscrowReleased ? 'released' : 'held',
        escrowReference: escrowRef,
        placedAt: item.placed_at ? new Date(item.placed_at) : (item.created_at ? new Date(item.created_at) : new Date()),
        trackingNotes: item.trackingNotes || [],
    }
}

function loadOrdersFromStorage() {
    const user = getCurrentUserData()
    const saved = localStorage.getItem('agri_orders')
    if (saved && user) {
        try {
            const parsed = JSON.parse(saved)
            const filtered = parsed.filter(item => {
                const isFarmerRole = user.role === 'farmer' || user.activeRole === 'farmer'
                if (isFarmerRole) {
                    return item.farmerId === String(user.id) ||
                        item.farmer?.id === String(user.id) ||
                        item.farmer?.phone === user.phone ||
                        (item.farmer?.name && user.name && item.farmer.name.toLowerCase() === user.name.toLowerCase())
                } else {
                    return item.buyerId === String(user.id) ||
                        item.buyer?.id === String(user.id) ||
                        item.buyer?.phone === user.phone ||
                        (item.buyer?.name && user.name && item.buyer.name.toLowerCase() === user.name.toLowerCase())
                }
            })
            return filtered.map((item) => ({
                ...item,
                placedAt: new Date(item.placedAt),
                dispatchedAt: item.dispatchedAt ? new Date(item.dispatchedAt) : undefined,
                deliveredAt: item.deliveredAt ? new Date(item.deliveredAt) : undefined,
                completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
            }))
        } catch {
            return []
        }
    }
    return []
}

export function useOrders() {
    const orders = ref(loadOrdersFromStorage())

    const refreshOrders = async () => {
        const token = getAuthToken()
        if (!token) return

        try {
            const user = getCurrentUserData()
            const role = user?.activeRole || user?.role || 'buyer'

            const res = role === 'farmer'
                ? await api.fetchMyFulfillments()
                : await api.fetchMyOrders()

            const rawItems = Array.isArray(res) ? res : (res?.data || [])
            orders.value = rawItems.map(mapRawOrderToFrontend)
        } catch {
            // Keep user-scoped filtered list if offline
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
            listingId: String(listing.id),
            listing,
            buyerId: String(buyer?.id || ''),
            buyer,
            farmerId: String(listing.farmerId || listing.farmer?.id || ''),
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

    const confirmDelivery = async (orderId, pin = '123456') => {
        const token = getAuthToken()
        if (token) {
            try {
                await api.verifyDeliveryPin(orderId, pin)
            } catch {
                // offline fallback
            }
        }

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
                let statusAction = 'accept'
                if (status === 'completed' || status === 'delivered') statusAction = 'complete'
                else if (status === 'dispatched' || status === 'in_transit') statusAction = 'accept'

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

    const dispatchOrder = (orderId) => {
        updateOrderStatus(orderId, 'dispatched', 'Shipment dispatched to destination')
    }

    return {
        orders,
        refreshOrders,
        placeOrder,
        confirmDelivery,
        updateOrderStatus,
        dispatchOrder,
    }
}
