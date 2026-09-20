import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { ApiError, api } from '../services/apiClient';
import type { User } from '../types';
import { App } from './App';

vi.mock('../pages/LoginPage', () => ({
    LoginPage: () => <div>Login page</div>,
}));

vi.mock('../features/workspace/Workspace', () => ({
    Workspace: ({ user }: { user: User }) => <div>Workspace for {user.name}</div>,
}));

afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState({}, '', '/');
});

it('opens the workspace when the session contains an authenticated user', async () => {
    vi.spyOn(api, 'user').mockResolvedValue({
        data: { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    });

    render(<App />);

    expect(await screen.findByText('Workspace for Ada Lovelace')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/dashboard');
});

it('preserves a direct link to the profile for an authenticated user', async () => {
    vi.spyOn(api, 'user').mockResolvedValue({
        data: { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    });
    window.history.replaceState({}, '', '/profile');

    render(<App />);

    expect(await screen.findByText('Workspace for Ada Lovelace')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/profile');
});

it('opens the login page when the session endpoint returns 401', async () => {
    vi.spyOn(api, 'user').mockRejectedValue(new ApiError('Unauthenticated.', 401));

    render(<App />);

    expect(await screen.findByText('Login page')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
});

it('shows a retryable error for failures other than an unauthenticated session', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'user')
        .mockRejectedValueOnce(new ApiError('Service unavailable.', 503))
        .mockResolvedValueOnce({
            data: { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
        });

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Service unavailable.');
    expect(window.location.pathname).toBe('/');

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Workspace for Ada Lovelace')).toBeInTheDocument();
    expect(api.user).toHaveBeenCalledTimes(2);
});
