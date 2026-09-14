export type CardType = 'remember' | 'explain' | 'apply' | 'note';
export type Rating = {
    id: number;
    card_type_id: number;
    name: string;
    description: string;
    recall_quality: 1 | 2 | 3 | 4;
};
export type CardTypeDefinition = {
    id: number;
    name: CardType;
    description: string;
    ratings: Rating[];
};
export type User = { id: number; name: string; email: string };
export type Learning = {
    due_at: string | null;
    last_reviewed_at: string | null;
    review_count: number;
    current_interval_minutes: number;
};
export type Card = {
    id: number;
    deck_id: number;
    type_id: number;
    type: CardTypeDefinition;
    sort_order: number;
    archived_at: string | null;
    content: Record<string, string | null>;
    learning?: Learning;
};
export type Deck = {
    id: number;
    name: string;
    description: string | null;
    sort_order: number;
    archived_at: string | null;
    cards_count?: number;
    archived_cards_count?: number;
};
export type PageMeta = { current_page: number; per_page: number; total: number; last_page: number };
export type Page<T> = { data: T[]; links: unknown; meta: PageMeta };
export type ApiResource<T> = { data: T };
export type CardReview = {
    id: number;
    card_id: number;
    rating_id: number;
    rating: Rating;
    reviewed_at: string;
    interval_before_minutes: number;
    interval_after_minutes: number;
    due_at_before: string | null;
    due_at_after: string | null;
    duration_ms: number | null;
};
