/**
 * Image helper utility for B2B Agri-Tech Marketplace.
 * Maps produce categories, features, and user roles to real photorealistic & vector image assets.
 */

export const CATEGORY_IMAGES = {
    coffee: '/images/coffee_produce.jpg',
    wheat: '/images/wheat_produce.jpg',
    grain: '/images/wheat_produce.jpg',
    cereal: '/images/wheat_produce.jpg',
    teff: '/images/wheat_produce.jpg',
    sesame: '/images/sesame_produce.jpg',
    pulse: '/images/sesame_produce.jpg',
    bean: '/images/sesame_produce.jpg',
    lentil: '/images/sesame_produce.jpg',
    vegetable: '/images/vegetables_produce.svg',
    tomato: '/images/vegetables_produce.svg',
    carrot: '/images/vegetables_produce.svg',
    salad: '/images/vegetables_produce.svg',
    fruit: '/images/fruits_produce.svg',
    avocado: '/images/fruits_produce.svg',
    banana: '/images/fruits_produce.svg',
    honey: '/images/honey_produce.svg',
    spice: '/images/honey_produce.svg',
    seed: '/images/seeds_produce.svg',
    oil: '/images/seeds_produce.svg',
    dairy: '/images/seeds_produce.svg',
    default: '/images/agri_placeholder.svg',
}

export function getCropImage(itemOrName) {
    if (!itemOrName) return CATEGORY_IMAGES.default

    // If an object with an uploaded image URL is provided, return uploaded image first!
    if (typeof itemOrName === 'object') {
        const path = itemOrName.image_url || itemOrName.image_path
        if (path) {
            if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
                return path
            }
            const cleanPath = path.replace(/^\/?storage\//, '')
            return `/storage/${cleanPath}`
        }
        itemOrName = itemOrName.title || itemOrName.category?.name || ''
    } else if (typeof itemOrName === 'string') {
        if (itemOrName.startsWith('http://') || itemOrName.startsWith('https://') || itemOrName.startsWith('/storage/') || itemOrName.startsWith('blob:') || itemOrName.startsWith('data:')) {
            return itemOrName
        }
    }

    const str = String(itemOrName).toLowerCase()

    for (const [key, path] of Object.entries(CATEGORY_IMAGES)) {
        if (key !== 'default' && str.includes(key)) {
            return path
        }
    }
    return CATEGORY_IMAGES.default
}

export function getAvatarImage(role) {
    const r = (role || '').toLowerCase()
    if (r.includes('farmer')) return '/images/farmer_avatar.svg'
    if (r.includes('buyer')) return '/images/buyer_avatar.svg'
    return '/images/buyer_avatar.svg'
}

export const EMPTY_STATE_IMAGE = '/images/empty_box.svg'
