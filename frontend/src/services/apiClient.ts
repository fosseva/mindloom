import type { ApiResource, Card, CardReview, CardTypeDefinition, Deck, Page, User } from '../types';
import { config } from '../app/config';

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);
    }
}

let csrfReady = false;
const cardIncludes = 'type.ratings,content,learning_record';
const url = (path: string) => `${config.apiBaseUrl}${path}`;
const csrf = async () => {
    if (csrfReady) return;
    const response = await fetch(url('/sanctum/csrf-cookie'), { credentials: 'include' });
    if (!response.ok) throw new ApiError('Unable to start a secure session.', response.status);
    csrfReady = true;
};
const cookie = (name: string) =>
    decodeURIComponent(
        document.cookie
            .split('; ')
            .find((value) => value.startsWith(`${name}=`))
            ?.split('=')
            .slice(1)
            .join('=') ?? '',
    );
const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
    if (init?.method && init.method !== 'GET') {
        await csrf();
    }
    const response = await fetch(url(path), {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(cookie('XSRF-TOKEN') ? { 'X-XSRF-TOKEN': cookie('XSRF-TOKEN') } : {}),
            ...init?.headers,
        },
        ...init,
    });
    if (!response.ok) {
        const body = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new ApiError(body.message ?? `Request failed (${response.status})`, response.status);
    }
    return response.status === 204 ? (undefined as T) : response.json();
};
export const api = {
    user: () => request<ApiResource<User>>('/api/v1/user'),
    login: (email: string, password: string) =>
        request<ApiResource<User>>('/api/v1/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
    logout: async () => {
        await request<void>('/api/v1/logout', { method: 'DELETE' });
        csrfReady = false;
    },
    decks: (search = '', archived = false, perPage?: number) =>
        request<Page<Deck>>(
            `/api/v1/decks?include=cards_count,archived_cards_count&sort=sort_order&filter[archived]=${archived ? 1 : 0}${search ? `&filter[name]=${encodeURIComponent(search)}` : ''}${perPage ? `&per_page=${perPage}` : ''}`,
        ),
    cards: (deckId: number, type = '', archived = false) =>
        request<Page<Card>>(
            `/api/v1/decks/${deckId}/cards?include=${cardIncludes}&sort=sort_order&filter[archived]=${archived ? 1 : 0}${type ? `&filter[type]=${type}` : ''}`,
        ),
    due: () => request<Page<Card>>(`/api/v1/cards/due?include=${cardIncludes}`),
    cardTypes: () => request<{ data: CardTypeDefinition[] }>('/api/v1/card-types?include=ratings'),
    createDeck: (body: { name: string; description?: string }) =>
        request<{ data: Deck }>('/api/v1/decks', { method: 'POST', body: JSON.stringify(body) }),
    updateDeck: (
        deckId: number,
        body: { name?: string; description?: string | null; archived_at?: string | null },
    ) =>
        request<{ data: Deck }>(`/api/v1/decks/${deckId}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),
    createCard: (deckId: number, body: Record<string, unknown>) =>
        request<{ data: Card }>(`/api/v1/decks/${deckId}/cards`, {
            method: 'POST',
            body: JSON.stringify(body),
        }),
    updateCard: (cardId: number, body: Record<string, unknown>) =>
        request<{ data: Card }>(`/api/v1/cards/${cardId}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),
    review: (cardId: number, ratingId: number, durationMs?: number) =>
        request<ApiResource<CardReview>>(`/api/v1/cards/${cardId}/reviews`, {
            method: 'POST',
            body: JSON.stringify({ rating_id: ratingId, duration_ms: durationMs }),
        }),
};
