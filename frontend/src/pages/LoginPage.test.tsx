import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '../services/apiClient';
import type { User } from '../types';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('authenticates with the credentials entered by the user', async () => {
        const user = userEvent.setup();
        const authenticated = vi.fn();
        const account: User = { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' };
        vi.spyOn(api, 'login').mockResolvedValue({ data: account });
        render(<LoginPage authenticated={authenticated} />);

        await user.type(screen.getByLabelText('Email'), account.email);
        await user.type(screen.getByLabelText('Password'), 'secret-password');
        await user.click(screen.getByRole('button', { name: 'Sign in' }));

        expect(api.login).toHaveBeenCalledWith(account.email, 'secret-password');
        expect(authenticated).toHaveBeenCalledWith(account);
    });

    it('shows the API error and allows another attempt', async () => {
        const user = userEvent.setup();
        vi.spyOn(api, 'login').mockRejectedValue(new Error('Invalid credentials.'));
        render(<LoginPage authenticated={vi.fn()} />);

        await user.type(screen.getByLabelText('Email'), 'ada@example.com');
        await user.type(screen.getByLabelText('Password'), 'wrong-password');
        await user.click(screen.getByRole('button', { name: 'Sign in' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials.');
        expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
    });
});
