import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../services/apiClient';
import { DeckForm } from './DeckForm';

describe('DeckForm', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('creates a deck and refreshes the view before closing', async () => {
        const user = userEvent.setup();
        const events: string[] = [];
        vi.spyOn(api, 'createDeck').mockImplementation(async (body) => {
            events.push(`created:${body.name}:${body.description}`);
            return {
                data: {
                    id: 1,
                    name: body.name,
                    description: body.description ?? null,
                    sort_order: 0,
                    archived_at: null,
                },
            };
        });
        render(
            <DeckForm
                saved={async () => {
                    events.push('saved');
                }}
                close={() => events.push('closed')}
            />,
        );

        await user.type(screen.getByLabelText('Name'), 'World Capitals');
        await user.type(screen.getByLabelText('Description'), 'Geography essentials');
        await user.click(screen.getByRole('button', { name: 'Create deck' }));

        expect(events).toEqual(['created:World Capitals:Geography essentials', 'saved', 'closed']);
    });
});
