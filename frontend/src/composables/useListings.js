import { ref, onMounted, watch } from 'vue'
import { api, getAuthToken } from '@/services/api'

const DEFAULT_PRODUCE = [
    {
        id: 'listing-1',
        farmerId: 'farmer-1',
        farmer: { id: 'farmer-1', name: 'Dawit Bekele', phone: '+251 912 345 678', role: 'farmer', region: 'Sidama', bank_code: 'CBE', bank_name: 'Commercial Bank of Ethiopia', account_number: '1000123456789', account_name: 'Dawit Bekele' },
        cropName: 'Sidama Washed Coffee G1',
        cropEmoji: '☕',
        category: 'coffee',
        grade: 'Grade 1',
        region: 'Sidama',
        zone: 'Hawassa',
        process: 'Washed',
        pricePerKg: 85,
        availableQty: 12000,
        minOrderQty: 500,
        harvestDate: new Date('2024-02-10'),
        description: 'Specialty Grade 1 washed Sidama Arabica coffee with floral jasmine aroma, bright citrus acidity, and clean bergamot notes.',
        images: [],
        isActive: true,
        isVerified: true,
        createdAt: new Date('2024-02-15'),
        viewCount: 342
    },
    {
        id: 'listing-2',
        farmerId: 'farmer-2',
        farmer: { id: 'farmer-2', name: 'Tadesse Tolossa', phone: '+251 911 456 789', role: 'farmer', region: 'Gojjam', bank_code: 'CBE', bank_name: 'Commercial Bank of Ethiopia', account_number: '1000987654321', account_name: 'Tadesse Tolossa' },
        cropName: 'Gojjam Magna White Teff',
        cropEmoji: '🌾',
        category: 'grains',
        grade: 'Magna Super Fine',
        region: 'Amhara',
        zone: 'East Gojjam',
        process: 'Sun-dried',
        pricePerKg: 65,
        availableQty: 25000,
        minOrderQty: 1000,
        harvestDate: new Date('2024-01-20'),
        description: 'Premium Magna white teff harvested from fertile volcanic soil in East Gojjam. 100% pure grain with zero husks or debris.',
        images: [],
        isActive: true,
        isVerified: true,
        createdAt: new Date('2024-01-25'),
        viewCount: 512
    },
    {
        id: 'listing-3',
        farmerId: 'farmer-3',
        farmer: { id: 'farmer-3', name: 'Abebe Girma', phone: '+251 911 876 543', role: 'farmer', region: 'Oromia', bank_code: 'TELEBIRR', bank_name: 'Telebirr Mobile Money', account_number: '0911876543', account_name: 'Abebe Girma' },
        cropName: 'Bale Durum Wheat',
        cropEmoji: '🌾',
        category: 'grains',
        grade: 'Grade A',
        region: 'Oromia',
        zone: 'Bale',
        process: 'Natural Machine Cleaned',
        pricePerKg: 28,
        availableQty: 55000,
        minOrderQty: 2000,
        harvestDate: new Date('2024-01-10'),
        description: 'High-protein durum wheat ideal for flour mills, pasta manufacturing, and commercial baking. Sourced from Bale highlands co-ops.',
        images: [],
        isActive: true,
        isVerified: true,
        createdAt: new Date('2024-01-15'),
        viewCount: 420
    },
    {
        id: 'listing-4',
        farmerId: 'farmer-4',
        farmer: { id: 'farmer-4', name: 'Kassahun Worku', phone: '+251 913 789 012', role: 'farmer', region: 'Tigray', bank_code: 'DASHEN', bank_name: 'Dashen Bank', account_number: '5098123456011', account_name: 'Kassahun Worku' },
        cropName: 'Humera White Sesame Seed',
        cropEmoji: '🌱',
        category: 'oilseeds',
        grade: '99% Purity Export Grade',
        region: 'Tigray',
        zone: 'Humera',
        process: 'Machine Cleaned',
        pricePerKg: 110,
        availableQty: 18000,
        minOrderQty: 500,
        harvestDate: new Date('2024-02-01'),
        description: 'World-renowned Humera white sesame with sweet nutty aroma and high oil content (>= 52%). Verified export quality.',
        images: [],
        isActive: true,
        isVerified: true,
        createdAt: new Date('2024-02-05'),
        viewCount: 289
    },
    {
        id: 'listing-5',
        farmerId: 'farmer-5',
        farmer: { id: 'farmer-5', name: 'Almaz Belay', phone: '+251 914 567 890', role: 'farmer', region: 'SNNPR', bank_code: 'AWASH', bank_name: 'Awash Bank', account_number: '0132098765400', account_name: 'Almaz Belay' },
        cropName: 'Jimma Black Pepper & Korarima Spices',
        cropEmoji: '🌶️',
        category: 'spices',
        grade: 'Premium Organic',
        region: 'SNNPR',
        zone: 'Keffa',
        process: 'Sun-dried Whole Spice',
        pricePerKg: 145,
        availableQty: 8500,
        minOrderQty: 100,
        harvestDate: new Date('2024-02-15'),
        description: 'Aromatic Ethiopian black pepper and wild Korarima cardamom gathered from pristine Keffa rainforest biosphere reserve.',
        images: [],
        isActive: true,
        isVerified: true,
        createdAt: new Date('2024-02-18'),
        viewCount: 195
    },
    {
        id: 'listing-6',
        farmerId: 'farmer-6',
        farmer: { id: 'farmer-6', name: 'Girma Wolde', phone: '+251 915 678 901', role: 'farmer', region: 'Oromia', bank_code: 'CBE', bank_name: 'Commercial Bank of Ethiopia', account_number: '1000345678901', account_name: 'Girma Wolde' },
        cropName: 'Harar Sun-Dried Red Haricot Beans',
        cropEmoji: '🫘',
        category: 'pulses',
        grade: 'Grade 1 Red',
        region: 'Oromia',
        zone: 'East Hararghe',
        process: 'Hand Picked Selected',
        pricePerKg: 42,
        availableQty: 32000,
        minOrderQty: 1000,
        harvestDate: new Date('2024-01-28'),
        description: 'Uniform red kidney & haricot beans suitable for canning, bulk food processing, and wholesale distribution.',
        images: [],
        isActive: true,
        isVerified: true,
        createdAt: new Date('2024-02-02'),
        viewCount: 310
    }
]

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
        farmer: {
            id: String(farmerObj.id || item.farmer_id || 'farmer-1'),
            name: farmerFullName,
            email: farmerObj.email || 'farmer@agri.et',
            phone: farmerObj.phone || item.farmer_phone || '+251 912 345 678',
            role: 'farmer',
            status: 'verified',
            region: farmerObj.region || item.region || 'Sidama',
            bank_code: farmerObj.bank_code || farmerObj.bank_name || 'CBE',
            bank_name: farmerObj.bank_name || 'Commercial Bank of Ethiopia',
            account_number: farmerObj.account_number || farmerObj.account_number_masked || '1000123456789',
            account_name: farmerObj.account_name || farmerFullName,
            farmSize: farmerObj.farmSize || 14.5,
            totalEarned: 0,
            rating: 4.9,
            reviewCount: 24,
            crops: [],
            createdAt: new Date(),
        },
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
        images: imagesList,
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

    return {
        listings,
        isLoading,
        refreshListings,
        addListing,
        getListingById,
        filterListings,
    }
}
