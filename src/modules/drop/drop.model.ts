export interface DropBase {
    listing_id: string;
    store_id: string;
    category_id: string;

    name: string;
    description: string;
    price: number;

    status: "draft" | "active" | "paused" | "sold_out" | "archived";
    fulfillment_mode: "immediate" | "scheduled";

    pickup_location: string;
    pickup_starts_at?: string;
    pickup_ends_at?: string;

    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface DropPreOrder extends DropBase {
    listing_type: "preorder";
    order_start_time: string;
    order_end_time: string;
}

export interface DropAlwaysOn extends DropBase {
    listing_type: "always_on";
    estimated_delivery_days: number;
}

export type Drop = DropPreOrder | DropAlwaysOn;

export type DropStatus = Drop["status"];
export type ListingType = Drop["listing_type"];
export type FulfillmentMode = Drop["fulfillment_mode"];

export type DropSortField =
    | "created_at"
    | "updated_at"
    | "price"
    | "name";

export interface DropFilters {
    search?: string;

    store_id?: string;
    category_id?: string;

    listing_type?: ListingType;
    status?: DropStatus;
    fulfillment_mode?: FulfillmentMode;

    min_price?: number;
    max_price?: number;

    pickup_location?: string;
    pickup_starts_after?: string;
    pickup_starts_before?: string;

    order_starts_after?: string;
    order_starts_before?: string;
    order_ends_after?: string;
    order_ends_before?: string;

    min_delivery_days?: number;
    max_delivery_days?: number;
}

export interface GetDropsParams {
    filters: DropFilters;

    pagination: {
        page: number;
        limit: number;
    };

    sort: {
        by: DropSortField;
        order: "asc" | "desc";
    };
}

export interface GetDropsResult {
    listings: Drop[];
    total: number;
}
