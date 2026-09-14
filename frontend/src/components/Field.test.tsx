import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Field } from './Field';

function PasswordField() {
    const [password, setPassword] = useState('');

    return <Field label="Password" value={password} setValue={setPassword} type="password" />;
}

describe('Field', () => {
    it('updates its value as the user types', async () => {
        const user = userEvent.setup();
        render(<PasswordField />);

        const password = screen.getByLabelText('Password');
        await user.type(password, 'correct horse');

        expect(password).toHaveValue('correct horse');
    });

    it('lets the user show and hide a password', async () => {
        const user = userEvent.setup();
        render(<PasswordField />);

        const password = screen.getByLabelText('Password');
        expect(password).toHaveAttribute('type', 'password');

        await user.click(screen.getByRole('button', { name: 'Show password' }));
        expect(password).toHaveAttribute('type', 'text');

        await user.click(screen.getByRole('button', { name: 'Hide password' }));
        expect(password).toHaveAttribute('type', 'password');
    });
});
