import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { api } from '../../services/apiClient';
import type { Deck, Page } from '../../types';
import { Workspace } from './Workspace';

const page = <T,>(data: T[]): Page<T> => ({
    data,
    links: {},
    meta: { current_page: 1, per_page: 15, total: data.length, last_page: 1 },
});

afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState({}, '', '/');
});

it('selects a newly created deck', async () => {
    const user = userEvent.setup();
    const existingDeck: Deck = {
        id: 1,
        name: 'Existing deck',
        description: null,
        sort_order: 0,
        archived_at: null,
    };
    let decks = [existingDeck];
    vi.spyOn(api, 'decks').mockImplementation(async (_search, archived) =>
        page(archived ? [] : decks),
    );
    vi.spyOn(api, 'cards').mockResolvedValue(page([]));
    vi.spyOn(api, 'due').mockResolvedValue(page([]));
    vi.spyOn(api, 'createDeck').mockImplementation(async ({ name, description }) => {
        const createdDeck: Deck = {
            id: 2,
            name,
            description: description ?? null,
            sort_order: 0,
            archived_at: null,
        };
        decks = [...decks, createdDeck];

        return { data: createdDeck };
    });
    window.history.replaceState({}, '', '/decks');
    render(
        <Workspace
            user={{ id: 1, name: 'Ada Lovelace', email: 'ada@example.com' }}
            loggedOut={vi.fn()}
        />,
    );
    await screen.findByRole('heading', { name: 'Existing deck' });

    await user.click(screen.getByRole('button', { name: 'Create deck' }));
    await user.type(screen.getByLabelText('Name'), 'New deck');
    await user.click(
        within(screen.getByRole('dialog', { name: 'Create a deck' })).getByRole('button', {
            name: 'Create deck',
        }),
    );

    await waitFor(() =>
        expect(screen.getByRole('heading', { name: 'New deck' })).toBeInTheDocument(),
    );
});

it('filters decks without replacing the workspace with a loading screen', async () => {
    const user = userEvent.setup();
    const deck: Deck = {
        id: 1,
        name: 'World Geography',
        description: null,
        sort_order: 0,
        archived_at: null,
    };
    const decksSpy = vi
        .spyOn(api, 'decks')
        .mockImplementation(async (_search, archived) => page(archived ? [] : [deck]));
    vi.spyOn(api, 'cards').mockResolvedValue(page([]));
    vi.spyOn(api, 'due').mockResolvedValue(page([]));
    window.history.replaceState({}, '', '/decks');

    render(
        <Workspace
            user={{ id: 1, name: 'Ada Lovelace', email: 'ada@example.com' }}
            loggedOut={vi.fn()}
        />,
    );
    await screen.findByRole('heading', { name: 'World Geography' });

    await user.type(screen.getByPlaceholderText('Filter decks'), 'world');

    expect(screen.getByRole('heading', { name: 'World Geography' })).toBeInTheDocument();
    expect(screen.queryByText('Loading your learning space…')).not.toBeInTheDocument();
    await waitFor(() => expect(decksSpy).toHaveBeenCalledWith('world'));
});
