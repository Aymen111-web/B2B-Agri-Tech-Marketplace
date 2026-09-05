export type UserRole = 'buyer' | 'farmer' | 'admin';
export type AccountStatus = 'pending' | 'verified' | 'suspended';
export type OrderStatus = 'placed' | 'confirmed' | 'dispatched' | 'in_transit' | 'delivered' | 'completed' | 'disputed';
export type EscrowStatus = 'held' | 'released' | 'refunded';
export type CropGrade = 'Grade 1' | 'Grade 2' | 'Grade A' | 'Export Quality' | 'Premium' | 'Standard';

export type CropCategory =
    | 'coffee'
    | 'grains'
    | 'spices'
    | 'oilseeds'
    | 'pulses'
    | 'roots'
    | 'fruits'
    | 'vegetables';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    activeRole?: UserRole;
    capabilities?: string[];
    pendingApplications?: string[];
    status: AccountStatus;
    region: string;
    avatar?: string;
    createdAt: Date;
}

export interface Farmer extends User {
    role: 'farmer';
    farmSize: number; // hectares
    totalEarned: number; // ETB
    rating: number; // 0–5
    reviewCount: number;
    crops: string[]; // specialties
}

export interface Buyer extends User {
    role: 'buyer';
    companyName: string;
    businessType: 'exporter' | 'processor' | 'wholesaler' | 'hotel' | 'supermarket' | 'other';
    totalOrdered: number; // ETB
}

export interface Listing {
    id: string;
    farmerId: string;
    farmer: Farmer;
    cropName: string;
    cropEmoji: string;
    category: CropCategory;
    grade: CropGrade;
    region: string;
    zone: string;
    process?: string; // e.g. "Washed", "Natural"
    pricePerKg: number; // ETB
    availableQty: number; // kg
    minOrderQty: number; // kg
    harvestDate: Date;
    moistureContent?: number; // percentage
    description: string;
    images: string[];
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    viewCount: number;
}

export interface Order {
    id: string;
    listingId: string;
    listing: Listing;
    buyerId: string;
    buyer: Buyer;
    farmerId: string;
    farmer: Farmer;
    quantityKg: number;
    totalAmountETB: number;
    status: OrderStatus;
    escrowStatus: EscrowStatus;
    escrowReference: string; // Chapa transaction ref
    placedAt: Date;
    dispatchedAt?: Date;
    deliveredAt?: Date;
    completedAt?: Date;
    trackingNotes: TrackingEvent[];
}

export interface TrackingEvent {
    id: string;
    orderId: string;
    status: OrderStatus;
    note: string;
    timestamp: Date;
    actorRole: UserRole;
}

export interface CapabilityApplication {
    id: string;
    userId: string;
    userName: string;
    role: 'farmer' | 'buyer';
    businessName?: string;
    documents: string[]; // uploaded file URLs
    status: 'pending' | 'approved' | 'rejected';
    reviewNote?: string;
    submittedAt: Date;
    reviewedAt?: Date;
}
