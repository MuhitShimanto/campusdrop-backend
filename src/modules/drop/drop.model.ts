export interface Drop {
    // References
    listing_id: string;
    store_id: string;
    category_id: string;
    // Type
    listing_type: "always_on" | "preorder";
    // Details
    name: string;
    description: string;
    price: number;
    // Status
    status: "draft" | "active" | "paused" | "sold_out" | "archived";
    fulfillment_mode: "immediate" | "scheduled";
    // Pickup
    pickup_location: string;
    pickup_starts_at?: string;
    pickup_ends_at?: string;
    // Timestamps
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface DropPreOrder extends Drop {
    order_start_time: string;
    order_end_time: string;
}

export interface DropAlwaysOn extends Drop {
    estimated_delivery_days: number;
}