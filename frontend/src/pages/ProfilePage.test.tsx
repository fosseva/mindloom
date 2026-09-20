import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { api } from '../services/apiClient';
import { ProfileScreen } from './ProfilePage';

afterEach(() => vi.restoreAllMocks());

it('updates the profile and reports the saved user', async () => {
    const browser = userEvent.setup();
    const userUpdated = vi.fn();
    vi.spyOn(api, 'updateProfile').mockResolvedValue({
        data: { id: 1, name: 'Grace Hopper', email: 'grace@example.com' },
    });

    render(
        <ProfileScreen
            user={{ id: 1, name: 'Ada Lovelace', email: 'ada@example.com' }}
            userUpdated={userUpdated}
        />,
    );

    await browser.clear(screen.getByLabelText('Full name'));
    await browser.type(screen.getByLabelText('Full name'), 'Grace Hopper');
    await browser.clear(screen.getByLabelText('Email address'));
    await browser.type(screen.getByLabelText('Email address'), 'grace@example.com');
    await browser.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Profile updated.');
    expect(userUpdated).toHaveBeenCalledWith({
        id: 1,
        name: 'Grace Hopper',
        email: 'grace@example.com',
    });
});

it('changes the password and clears the sensitive fields', async () => {
    const browser = userEvent.setup();
    vi.spyOn(api, 'updatePassword').mockResolvedValue();

    render(
        <ProfileScreen
            user={{ id: 1, name: 'Ada Lovelace', email: 'ada@example.com' }}
            userUpdated={vi.fn()}
        />,
    );

    await browser.type(screen.getByLabelText('Current password'), 'old-password');
    await browser.type(screen.getByLabelText('New password'), 'new-password');
    await browser.type(screen.getByLabelText('Confirm new password'), 'new-password');
    await browser.click(screen.getByRole('button', { name: 'Update password' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Password changed securely.');
    expect(screen.getByLabelText('Current password')).toHaveValue('');
    expect(screen.getByLabelText('New password')).toHaveValue('');
    expect(screen.getByLabelText('Confirm new password')).toHaveValue('');
});
