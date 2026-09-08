import { ref, onMounted, watch } from 'vue'
import { api, getAuthToken } from '@/services/api'

const DEFAULT_PRODUCE = []

function mapRawListingToFrontend(item) {
    const farmerObj = item.farmer || {}
    const farmerFirstName = farmerObj.first_name || ''
    const farmerSecondName = farmerObj.second_name || ''
    const farmerFullName = `${farmerFirstName} ${farmerSecondName}`.trim() || farmerObj.name || 'Dawit Bekele'

    let imagesList = []
    if (Array.isArray(item.images) && item.images.length > 0) {
        imagesList = item.images.map(img => {
            if (typeof img === 'string') {
                return img.startsWith('http') || img.startsWith('blob:') || img.startsWith('data:')
                    ? img
                    : `http://127.0.0.1:8000/storage/${img.replace(/^\/?storage\//, '')}`
            }
            if (img && img.image_path) {
                return img.image_path.startsWith('http') || img.image_path.startsWith('blob:')
                    ? img.image_path
                    : `http://127.0.0.1:8000/storage/${img.image_path.replace(/^\/?storage\//, '')}`
            }
            return img
        }).filter(Boolean)
    }

    let primaryImg = item.image_url || (item.image_path
        ? (item.image_path.startsWith('http') || item.image_path.startsWith('blob:') || item.image_path.startsWith('data:')
            ? item.image_path
            : `http://127.0.0.1:8000/storage/${item.image_path.replace(/^\/?storage\//, '')}`)
        : null)

    if (!primaryImg && imagesList.length > 0) {
        primaryImg = imagesList[0]
    }
    if (primaryImg && !imagesList.includes(primaryImg)) {
        imagesList.unshift(primaryImg)
    }

    return {
        id: String(item.id),
        farmerId: String(item.farmer_id || item.farmerId || 'farmer-1'),
        farmer: item.farmer ? {
            id: String(item.farmer.id || 'farmer-1'),
            name: `${item.farmer.first_name || ''} ${item.farmer.second_name || ''}`.trim() || item.farmer.name || 'Dawit Bekele',
            email: item.farmer.email || 'farmer@agri.et',
            phone: item.farmer.phone || '+251 912 345 678',
            role: 'farmer', status: 'verified', region: item.farmer.region || 'SNNPR',
            bank_code: farmerObj.bank_code || farmerObj.bank_name || 'CBE',
            bank_name: farmerObj.bank_name || 'Commercial Bank of Ethiopia',
            account_number: farmerObj.account_number || farmerObj.account_number_masked || '1000123456789',
            account_name: farmerObj.account_name || farmerFullName,
            farmSize: item.farmer.farmSize || 0, totalEarned: 0, rating: 0, reviewCount: 0, crops: [], createdAt: new Date(),
        } : { name: 'Unknown Farmer', role: 'farmer', region: 'Unknown' },
        cropName: item.title || item.cropName || 'Produce',
        cropEmoji: item.crop_emoji || item.cropEmoji || '🌾',
        category: item.category?.slug || item.category || 'grains',
        grade: item.grade || item.quality_grade || 'Grade 1',
        region: item.region || 'Sidama',
        zone: item.zone || 'Zone 1',
        process: item.process || 'Sun-dried',
        pricePerKg: Number(item.price_per_unit ?? item.pricePerKg ?? 50),
        availableQty: Number(item.quantity_available ?? item.availableQty ?? 1000),
        minOrderQty: Number(item.min_order_qty ?? item.min_order_quantity ?? item.minOrderQty ?? 100),
        harvestDate: item.harvest_date ? new Date(item.harvest_date) : new Date(),
        description: item.description || '',
        primaryImage: primaryImg,
        images: imagesList.length > 0 ? imagesList : (item.image_path ? [`http://127.0.0.1:8000/storage/${item.image_path}`] : (item.images || [])),
        isActive: item.status === 'active' || item.isActive !== false,
        isVerified: true,
        createdAt: item.created_at ? new Date(item.created_at) : new Date(),
        viewCount: item.view_count || item.viewCount || 1,
    }
}

export function useListings() {
    const listings = ref([])
    const isLoading = ref(false)

    // Load from localStorage or use default produce list
    const saved = localStorage.getItem('agri_listings')
    if (saved) {
        try {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0) {
                listings.value = parsed.map((item) => ({
                    ...item,
                    harvestDate: new Date(item.harvestDate),
                    createdAt: new Date(item.createdAt),
                }))
            } else {
                listings.value = [...DEFAULT_PRODUCE]
            }
        } catch {
            listings.value = [...DEFAULT_PRODUCE]
        }
    } else {
        listings.value = [...DEFAULT_PRODUCE]
    }

    const refreshListings = async () => {
        isLoading.value = true
        try {
            const userData = localStorage.getItem('agri_user_data')
            const token = getAuthToken()
            let role = 'buyer'
            if (userData) {
                try {
                    const parsed = JSON.parse(userData)
                    role = parsed.activeRole || parsed.role || 'buyer'
                } catch { /* ignore */ }
            }

            const res = (token && role === 'farmer')
                ? await api.fetchMyListings()
                : await api.fetchPublicListings()

            const rawItems = Array.isArray(res) ? res : (res?.data || [])
            listings.value = rawItems.map(mapRawListingToFrontend)
        } catch {
            // Keep current listings if API fails
        } finally {
            isLoading.value = false
        }
    }

    // Persist to localStorage on change
    watch(listings, (val) => {
        localStorage.setItem('agri_listings', JSON.stringify(val))
    }, { deep: true })

    // Refresh on mount
    onMounted(() => {
        refreshListings()
    })

    const addListing = async (newListingData) => {
        const token = getAuthToken()

        if (token) {
            try {
                const formData = new FormData()
                formData.append('title', newListingData.cropName || 'Produce Batch')

                const categoryMap = {
                    'grains': 1,
                    'cereals-grains': 1,
                    'oilseeds': 2,
                    'coffee': 3,
                    'vegetables': 4,
                    'fruits': 5,
                    'honey-bee-products': 6,
                    'dairy-products': 7,
                    'spices': 8,
                    'pulses': 1,
                    'roots': 4,
                }
                const catId = categoryMap[newListingData.category] || 1
                formData.append('category_id', catId)

                if (newListingData.description) formData.append('description', newListingData.description)
                formData.append('unit', 'kg')
                formData.append('price_per_unit', newListingData.pricePerKg || 1)
                formData.append('quantity_available', newListingData.availableQty || 1)
                if (newListingData.minOrderQty) formData.append('minimum_order_quantity', newListingData.minOrderQty)

                if (newListingData.harvestDate) {
                    try {
                        const d = new Date(newListingData.harvestDate)
                        if (!isNaN(d.getTime())) {
                            formData.append('harvest_date', d.toISOString().split('T')[0])
                        }
                    } catch { /* ignore */ }
                }
                if (newListingData.grade) formData.append('quality_grade', newListingData.grade)

                if (newListingData.images && newListingData.images.length > 0) {
                    newListingData.images.forEach((file) => {
                        if (file instanceof File || file instanceof Blob) {
                            formData.append('images[]', file)
                        }
                    })
                }

                const res = await api.createListing(formData)
                const rawObj = res?.listing || res?.data || res
                if (rawObj) {
                    const created = mapRawListingToFrontend(rawObj)
                    listings.value = [created, ...listings.value]
                    return created
                }
            } catch (err) {
                console.error('API createListing failed:', err)
                throw err
            }
        }

        const created = {
            ...newListingData,
            id: `listing-${Date.now()}`,
            createdAt: new Date(),
            viewCount: 1,
        }
        listings.value = [created, ...listings.value]
        return created
    }

    const getListingById = (id) => {
        if (!id) return null
        return listings.value.find((item) => String(item.id) === String(id))
    }

    const filterListings = (category, query) => {
        return listings.value.filter((item) => {
            const matchCat = !category || category === 'all' || item.category === category
            const matchQuery =
                !query ||
                item.cropName.toLowerCase().includes(query.toLowerCase()) ||
                item.region.toLowerCase().includes(query.toLowerCase()) ||
                item.farmer?.name?.toLowerCase().includes(query.toLowerCase()) ||
                item.grade.toLowerCase().includes(query.toLowerCase())
            return matchCat && matchQuery
        })
    }

    const deleteListing = async (id) => {
        try {
            await api.deleteListing(id)
            listings.value = listings.value.filter(l => String(l.id) !== String(id))
            return true
        } catch (err) {
            console.error('Failed to delete listing', err)
            return false
        }
    }

    return {
        listings,
        isLoading,
        refreshListings,
        addListing,
        deleteListing,
        getListingById,
        filterListings,
    }
}
