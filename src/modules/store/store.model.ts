export interface Store {
    store_id: string;
    user_id: string;
    name: string;
    slug: string;
    avatar: string | null;
    cover: string | null;
    description: string | null;
    created_at: string;
    updated_at: string;
}