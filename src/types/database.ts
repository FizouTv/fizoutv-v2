export type UserRole = "member" | "admin";

export interface Profile {
    id: string;
    display_name: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    role: UserRole;
    avatar_url: string | null;
    nationality: string | null;
    sex: string | null;
    date_of_birth: string | null;
    stats_consent?: boolean;
    created_at: string;
    updated_at: string;
}

export interface Author {
    id: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    created_at: string;
}

export interface Article {
    id: string;
    title: string;
    slug: string;
    chapo: string | null;
    content: Record<string, unknown> | null; // TipTap JSON
    cover_image_url: string | null;
    category_id: string;
    author_id: string;
    is_featured: boolean;
    is_exclusive: boolean;
    is_published: boolean;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    // Joined fields
    category?: Category;
    author?: Profile;
}

export interface Subscriber {
    id: string;
    email: string;
    gdpr_consent: boolean;
    subscribed_at: string;
}

export interface Poll {
    id: string;
    question: string;
    options: string[]; // JSON array
    is_active: boolean;
    scheduled_for: string | null;
    created_by: string;
    created_at: string;
}

export interface PollVote {
    id: string;
    poll_id: string;
    option_index: number;
    voter_id: string;
    created_at: string;
}
