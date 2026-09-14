import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { api } from '../../services/apiClient';
import type { Card } from '../../types';
import { formatReviewInterval, LearningCard } from './CardDisplay';

const card: Card = {
    id: 7,
    deck_id: 2,
    type_id: 4,
    type: {
        id: 4,
        name: 'note',
        description: 'A note worth revisiting.',
        ratings: [
            { id: 41, card_type_id: 4, name: 'Revisit', description: 'Show this again soon.', recall_quality: 1 },
            { id: 42, card_type_id: 4, name: 'Internalized', description: 'This feels familiar.', recall_quality: 4 },
        ],
    },
    sort_order: 0,
    archived_at: null,
    content: { title: 'Useful idea', content: 'Prefer simple systems.' },
    learning: { due_at: null, last_reviewed_at: null, review_count: 0, current_interval_minutes: 0 },
};

afterEach(() => vi.restoreAllMocks());

it.each([
    [20, '20 min'],
    [90, '90 min'],
    [1862, 'about 1 day'],
    [11946, 'about 8 days'],
])('formats %i minutes as a natural duration', (minutes, expected) => {
    expect(formatReviewInterval(minutes)).toBe(expected);
});

it('submits the database rating selected by the user', async () => {
    const user = userEvent.setup();
    const reviewed = vi.fn().mockResolvedValue(undefined);
    const review = vi.spyOn(api, 'review').mockResolvedValue({
        data: {
            id: 8,
            card_id: card.id,
            rating_id: 41,
            rating: card.type.ratings[0],
            reviewed_at: '2026-09-14T10:00:00Z',
            interval_before_minutes: 0,
            interval_after_minutes: 20,
            due_at_before: null,
            due_at_after: '2026-09-14T10:20:00Z',
            duration_ms: 1000,
        },
    });
    render(<LearningCard card={card} reviewed={reviewed} />);

    await user.click(screen.getByRole('button', { name: 'Revisit' }));

    expect(review).toHaveBeenCalledWith(card.id, 41, expect.any(Number));
    expect(screen.getByText("You'll see this again in 20 min")).toBeInTheDocument();
});
