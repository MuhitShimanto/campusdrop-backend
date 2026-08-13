CREATE TYPE account_status AS ENUM (
    'active',
    'suspended',
    'banned'
);

CREATE TYPE user_role AS ENUM (
    'user',
    'admin',
    'super_admin'
);

CREATE TYPE listing_fulfillment_mode AS ENUM (
    'scheduled',
    'immediate'
);

CREATE TYPE listing_status AS ENUM (
    'draft',
    'active',
    'paused',
    'sold_out',
    'archived'
);

CREATE TYPE listing_type AS ENUM (
    'always_on',
    'preorder'
);

CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'ready',
    'completed',
    'cancelled'
);

CREATE TYPE scanner_status AS ENUM (
    'active',
    'expired',
    'revoked'
);

CREATE TYPE waitlist_entry_status AS ENUM (
    'waiting',
    'notified',
    'claimed',
    'expired',
    'cancelled'
);

CREATE TYPE bug_report_status AS ENUM (
    'open',
    'in_progress',
    'resolved',
    'closed'
);

CREATE TYPE no_show_appeal_status AS ENUM (
    'pending',
    'accepted',
    'rejected'
);

CREATE TABLE users (
        user_id uuid NOT NULL,
        sid varchar(20) UNIQUE,
        name varchar(100) NOT NULL,
        slug varchar(100) UNIQUE,
        avatar text,
        university_email varchar(254) UNIQUE,
        account_status account_status NOT NULL DEFAULT 'active',
        role user_role NOT NULL DEFAULT 'user',
        is_verified boolean NOT NULL DEFAULT FALSE,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

        PRIMARY KEY (user_id)
    );

CREATE TABLE phone_numbers (
        id uuid NOT NULL,
        user_id uuid NOT NULL,
        number varchar(15) NOT NULL,
        PRIMARY KEY (id)
    );

CREATE INDEX phone_number_index_user_id ON phone_numbers (user_id);

CREATE TABLE stores (
    store_id uuid NOT NULL,
    user_id uuid NOT NULL UNIQUE,
    name varchar(150),
    slug varchar(150) UNIQUE,

    avatar text,
    cover text,
    description text,

    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (store_id)
);

CREATE INDEX store_index_name
    ON stores (name);

    CREATE TABLE categories (
    category_id uuid NOT NULL,
    name varchar(100) NOT NULL UNIQUE,
    slug varchar(100) NOT NULL UNIQUE,

    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT category_name_not_blank
        CHECK (length(trim(name)) > 0),

    PRIMARY KEY (category_id)
);

CREATE TABLE listings (
    listing_id uuid NOT NULL,
    listing_type listing_type NOT NULL,
    store_id uuid NOT NULL,
    category_id uuid NOT NULL,

    name varchar(150) NOT NULL,
    description text,

    price numeric(12,2) NOT NULL DEFAULT 0,

    status listing_status NOT NULL DEFAULT 'draft',
    fulfillment_mode listing_fulfillment_mode NOT NULL,

    pickup_location text,
    pickup_starts_at timestamptz,
    pickup_ends_at timestamptz,

    deleted_at timestamptz,

    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT listing_price_non_negative
        CHECK (price >= 0),

    CONSTRAINT listing_pickup_time_valid
        CHECK (
            pickup_starts_at IS NULL
            OR pickup_ends_at IS NULL
            OR pickup_starts_at <= pickup_ends_at
        ),
    
    CONSTRAINT listing_name_not_blank
        CHECK (length(trim(name)) > 0),

    PRIMARY KEY (listing_id)
);

CREATE INDEX listing_index_type
    ON listings (listing_type);

CREATE INDEX listing_index_status
    ON listings (status);

CREATE INDEX listing_index_fulfillment_mode
    ON listings (fulfillment_mode);

CREATE INDEX listing_index_category_id
    ON listings (category_id);

CREATE INDEX listing_index_store_id
    ON listings (store_id);



-- ============================================================
-- LISTING DETAILS
--
-- The backend is responsible for ensuring that:
--
-- always_on
--     -> one listing_alwayson_detail
--
-- preorder
--     -> one listing_preorder_detail
--
-- These records should be created in the same transaction
-- as the listing.
-- ============================================================

CREATE TABLE listing_preorder_details (
    listing_id uuid NOT NULL,

    order_start_time timestamptz NOT NULL,
    order_end_time timestamptz NOT NULL,

    CONSTRAINT listing_preorder_time_check
        CHECK (order_start_time <= order_end_time),

    PRIMARY KEY (listing_id)
);


CREATE TABLE listing_alwayson_details (
    listing_id uuid NOT NULL,
    estimated_delivery_days int NOT NULL,

    CONSTRAINT listing_alwayson_delivery_check
        CHECK (estimated_delivery_days >= 0),

    PRIMARY KEY (listing_id)
);


CREATE TABLE listing_images (
    image_id uuid NOT NULL,
    listing_id uuid NOT NULL,
    url text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,

    CONSTRAINT listing_image_sort_order_check
        CHECK (sort_order >= 0),

    CONSTRAINT listing_image_listing_order_unique
        UNIQUE (listing_id, sort_order),
        
    PRIMARY KEY (image_id)
);

-- ============================================================
-- INVENTORY
--
-- Every listing is expected to have exactly one inventory row.
-- The backend creates the listing and inventory row in the
-- same transaction.
-- ============================================================

CREATE TABLE inventories (
    listing_id uuid NOT NULL,

    quantity int NOT NULL DEFAULT 0,
    low_stock_threshold int,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT inventory_low_stock_threshold_check
        CHECK (
            low_stock_threshold IS NULL
            OR low_stock_threshold >= 0
        ),

    CONSTRAINT inventory_quantity_check
        CHECK (quantity >= 0),

    PRIMARY KEY (listing_id)
);

CREATE TABLE option_groups (
    option_group_id uuid NOT NULL,

    listing_id uuid NOT NULL,

    name varchar(150) NOT NULL,

    is_multiple boolean NOT NULL DEFAULT FALSE,
    is_required boolean NOT NULL DEFAULT FALSE,

    sort_order integer NOT NULL DEFAULT 0,

    CONSTRAINT option_group_name_not_blank
        CHECK (length(trim(name)) > 0),

    CONSTRAINT option_group_sort_order_check
        CHECK (sort_order >= 0),

    UNIQUE (listing_id, name),

    PRIMARY KEY (option_group_id)
);



CREATE TABLE option_values (
    value_id uuid NOT NULL,
    option_group_id uuid NOT NULL,
    name varchar(100) NOT NULL,
    price_adjustment numeric(12,2) NOT NULL DEFAULT 0,
    sort_order integer NOT NULL DEFAULT 0,

    CONSTRAINT option_value_name_not_blank
        CHECK (length(trim(name)) > 0),
        
    CONSTRAINT option_value_sort_order_check
        CHECK (sort_order >= 0),

    UNIQUE (option_group_id, name),

    PRIMARY KEY (value_id)
);


CREATE TABLE orders (
    order_id uuid NOT NULL,
    user_id uuid NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    pickup_exact_location text,
    pickup_exact_starts_at timestamptz,
    pickup_exact_ends_at timestamptz,

    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (total_amount >= 0),

    CONSTRAINT orders_pickup_time_check
        CHECK (
            pickup_exact_starts_at IS NULL
            OR pickup_exact_ends_at IS NULL
            OR pickup_exact_starts_at <= pickup_exact_ends_at
        ),

    PRIMARY KEY (order_id)
);

CREATE INDEX order_index_user_id
    ON orders (user_id);


CREATE TABLE order_items (
    order_item_id uuid NOT NULL,
    order_id uuid NOT NULL,
    listing_id uuid NOT NULL,
    quantity int NOT NULL,
    unit_price_snapshot numeric(12,2) NOT NULL,

    CONSTRAINT order_item_quantity_check
        CHECK (quantity > 0),
    CONSTRAINT order_item_unit_price_check
        CHECK (unit_price_snapshot >= 0),

    PRIMARY KEY (order_item_id)
);

CREATE INDEX order_item_index_listing_id
    ON order_items (listing_id);

CREATE INDEX order_item_index_order_id
    ON order_items (order_id);


CREATE TABLE order_item_options (
    selection_id uuid NOT NULL,
    order_item_id uuid NOT NULL,
    value_id uuid NOT NULL,
    name_snapshot varchar NOT NULL,
    price_adjustment_snapshot numeric(12,2) NOT NULL,

    PRIMARY KEY (selection_id),

    CONSTRAINT order_item_options_unique
        UNIQUE (order_item_id, value_id)
);

CREATE INDEX order_item_options_index_value_id
    ON order_item_options (value_id);


CREATE TABLE reviews (
    review_id uuid NOT NULL,
    order_item_id uuid NOT NULL UNIQUE,
    rating int NOT NULL,
    comment text,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT review_rating_check
        CHECK (rating BETWEEN 1 AND 5),

    PRIMARY KEY (review_id)
);

CREATE TABLE notification_types (
    notification_type_id uuid NOT NULL,
    name varchar(150) NOT NULL UNIQUE,
    target_resource_name varchar(100),

    CONSTRAINT notification_type_name_not_blank
        CHECK (length(trim(name)) > 0),

    PRIMARY KEY (notification_type_id)
);


CREATE TABLE notifications (
    notification_id uuid NOT NULL,
    user_id uuid NOT NULL,
    notification_type_id uuid NOT NULL,
    title varchar NOT NULL,
    message text NOT NULL,
    image varchar,
    target_id uuid,
    read_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (notification_id)
);

CREATE INDEX notification_user_created_at_idx
    ON notifications (user_id, created_at DESC);

CREATE TABLE scanner_codes (
    scanner_id uuid NOT NULL,
    order_id uuid NOT NULL,
    qr_data text NOT NULL UNIQUE,
    status scanner_status NOT NULL DEFAULT 'active',
    scanned_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (scanner_id)
);

CREATE INDEX scanner_code_index_order_id
    ON scanner_codes (order_id);

-- Exactly one active scanner per order.
CREATE UNIQUE INDEX scanner_one_active_per_order_idx
    ON scanner_codes (order_id)
    WHERE status = 'active';

CREATE TABLE waitlist_entries (
    entry_id uuid NOT NULL,
    listing_id uuid NOT NULL,
    user_id uuid NOT NULL,
    queue_position int NOT NULL,
    status waitlist_entry_status NOT NULL DEFAULT 'waiting',
    joined_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT waitlist_entry_queue_position_check
        CHECK (queue_position > 0),

    PRIMARY KEY (entry_id)
);

CREATE UNIQUE INDEX waitlist_entry_unique_queue_position_idx
    ON waitlist_entries (listing_id, queue_position);

CREATE INDEX waitlist_entry_next_idx
    ON waitlist_entries (listing_id, queue_position)
    WHERE status = 'waiting';

CREATE INDEX waitlist_entry_index_user_id
    ON waitlist_entries (user_id);

-- One active waitlist entry per user per listing.
CREATE UNIQUE INDEX waitlist_entry_one_active_per_user_listing_idx
    ON waitlist_entries (listing_id, user_id)
    WHERE status IN ('waiting', 'notified');

CREATE TABLE bug_reports (
    bug_report_id uuid NOT NULL,
    reported_by uuid NOT NULL,
    title varchar(200) NOT NULL,
    description text,
    category varchar(50),
    status bug_report_status NOT NULL DEFAULT 'open',
    assigned_to uuid,
    page text,
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at timestamptz,

    PRIMARY KEY (bug_report_id),

    CONSTRAINT bug_report_title_not_blank
        CHECK (length(trim(title)) > 0)
);

CREATE INDEX bug_report_index_assigned_to
    ON bug_reports (assigned_to);

CREATE INDEX bug_report_index_reported_by
    ON bug_reports (reported_by);

CREATE INDEX bug_report_index_status
    ON bug_reports (status);

CREATE TABLE no_show_reports (
    report_id uuid NOT NULL,
    order_id uuid NOT NULL,
    filed_by_user_id uuid NOT NULL,
    filed_against_user_id uuid NOT NULL,
    reason text,
    appeal_status no_show_appeal_status NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT no_show_report_different_users
        CHECK (filed_by_user_id <> filed_against_user_id),
    PRIMARY KEY (report_id),

    CONSTRAINT no_show_report_unique_pair
        UNIQUE (
            order_id,
            filed_by_user_id,
            filed_against_user_id
        )
);

CREATE INDEX no_show_report_index_filed_against_user_id
    ON no_show_reports (filed_against_user_id);

CREATE INDEX no_show_report_index_filed_by_user_id
    ON no_show_reports (filed_by_user_id);


-- ============================================================
-- FOREIGN KEYS
-- ============================================================

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------

ALTER TABLE phone_numbers
    ADD CONSTRAINT fk_phone_number_user_id
    FOREIGN KEY (user_id)
    REFERENCES users (user_id)
    ON DELETE CASCADE;


ALTER TABLE stores
    ADD CONSTRAINT fk_store_user_id
    FOREIGN KEY (user_id)
    REFERENCES users (user_id)
    ON DELETE NO ACTION;


ALTER TABLE orders
    ADD CONSTRAINT fk_orders_user_id
    FOREIGN KEY (user_id)
    REFERENCES users (user_id)
    ON DELETE NO ACTION;



ALTER TABLE notifications
    ADD CONSTRAINT fk_notification_user_id
    FOREIGN KEY (user_id)
    REFERENCES users (user_id)
    ON DELETE CASCADE;


ALTER TABLE no_show_reports
    ADD CONSTRAINT fk_no_show_report_filed_by_user_id
    FOREIGN KEY (filed_by_user_id)
    REFERENCES users (user_id)
    ON DELETE NO ACTION;


ALTER TABLE no_show_reports
    ADD CONSTRAINT fk_no_show_report_filed_against_user_id
    FOREIGN KEY (filed_against_user_id)
    REFERENCES users (user_id)
    ON DELETE NO ACTION;


ALTER TABLE bug_reports
    ADD CONSTRAINT fk_bug_report_reported_by_user
    FOREIGN KEY (reported_by)
    REFERENCES users (user_id)
    ON DELETE NO ACTION;


ALTER TABLE bug_reports
    ADD CONSTRAINT fk_bug_report_assigned_to_user
    FOREIGN KEY (assigned_to)
    REFERENCES users (user_id)
    ON DELETE SET NULL;


ALTER TABLE waitlist_entries
    ADD CONSTRAINT fk_waitlist_entry_user_id
    FOREIGN KEY (user_id)
    REFERENCES users (user_id)
    ON DELETE CASCADE;


-- ------------------------------------------------------------
-- Store / Listing
-- ------------------------------------------------------------

ALTER TABLE listings
    ADD CONSTRAINT fk_listing_store_id
    FOREIGN KEY (store_id)
    REFERENCES stores (store_id)
    ON DELETE NO ACTION;


ALTER TABLE listings
    ADD CONSTRAINT fk_listing_category_id
    FOREIGN KEY (category_id)
    REFERENCES categories (category_id)
    ON DELETE NO ACTION;


-- ------------------------------------------------------------
-- Listing dependent data
-- ------------------------------------------------------------

ALTER TABLE listing_preorder_details
    ADD CONSTRAINT fk_listing_preorder_detail_listing_id
    FOREIGN KEY (listing_id)
    REFERENCES listings (listing_id)
    ON DELETE CASCADE;


ALTER TABLE listing_alwayson_details
    ADD CONSTRAINT fk_listing_alwayson_detail_listing_id
    FOREIGN KEY (listing_id)
    REFERENCES listings (listing_id)
    ON DELETE CASCADE;


ALTER TABLE listing_images
    ADD CONSTRAINT fk_listing_image_listing_id
    FOREIGN KEY (listing_id)
    REFERENCES listings (listing_id)
    ON DELETE CASCADE;


ALTER TABLE inventories
    ADD CONSTRAINT fk_inventory_listing_id
    FOREIGN KEY (listing_id)
    REFERENCES listings (listing_id)
    ON DELETE CASCADE;


ALTER TABLE option_groups
    ADD CONSTRAINT fk_option_group_listing_id
    FOREIGN KEY (listing_id)
    REFERENCES listings (listing_id)
    ON DELETE CASCADE;


ALTER TABLE waitlist_entries
    ADD CONSTRAINT fk_waitlist_entry_listing_id
    FOREIGN KEY (listing_id)
    REFERENCES listings (listing_id)
    ON DELETE CASCADE;


-- ------------------------------------------------------------
-- Options
-- ------------------------------------------------------------

ALTER TABLE option_values
    ADD CONSTRAINT fk_option_value_option_group_id
    FOREIGN KEY (option_group_id)
    REFERENCES option_groups (option_group_id)
    ON DELETE CASCADE;


-- ------------------------------------------------------------
-- Orders
-- ------------------------------------------------------------

ALTER TABLE order_items
    ADD CONSTRAINT fk_order_item_order_id
    FOREIGN KEY (order_id)
    REFERENCES orders (order_id)
    ON DELETE NO ACTION;


ALTER TABLE order_items
    ADD CONSTRAINT fk_order_item_listing_id
    FOREIGN KEY (listing_id)
    REFERENCES listings (listing_id)
    ON DELETE NO ACTION;


ALTER TABLE order_item_options
    ADD CONSTRAINT fk_order_item_options_order_item_id
    FOREIGN KEY (order_item_id)
    REFERENCES order_items (order_item_id)
    ON DELETE CASCADE;


ALTER TABLE order_item_options
    ADD CONSTRAINT fk_order_item_options_value_id
    FOREIGN KEY (value_id)
    REFERENCES option_values (value_id)
    ON DELETE NO ACTION;


ALTER TABLE reviews
    ADD CONSTRAINT fk_review_order_item_id
    FOREIGN KEY (order_item_id)
    REFERENCES order_items (order_item_id)
    ON DELETE NO ACTION;


-- ------------------------------------------------------------
-- Scanner
-- ------------------------------------------------------------

ALTER TABLE scanner_codes
    ADD CONSTRAINT fk_scanner_code_order_id
    FOREIGN KEY (order_id)
    REFERENCES orders (order_id)
    ON DELETE CASCADE;


-- ------------------------------------------------------------
-- Notifications
-- ------------------------------------------------------------

CREATE INDEX notification_index_notification_type_id
    ON notifications (notification_type_id);

ALTER TABLE notifications
    ADD CONSTRAINT fk_notification_notification_type_id
    FOREIGN KEY (notification_type_id)
    REFERENCES notification_types (notification_type_id)
    ON DELETE NO ACTION;


-- ------------------------------------------------------------
-- No-show reports
-- ------------------------------------------------------------

ALTER TABLE no_show_reports
    ADD CONSTRAINT fk_no_show_report_order_id
    FOREIGN KEY (order_id)
    REFERENCES orders (order_id)
    ON DELETE CASCADE;