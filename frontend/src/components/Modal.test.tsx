import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmArchiveDialog, Modal } from './Modal';

describe('Modal', () => {
    it('closes when the user presses Escape', async () => {
        const user = userEvent.setup();
        const close = vi.fn();
        render(
            <Modal title="Edit card" close={close}>
                Card fields
            </Modal>,
        );

        await user.keyboard('{Escape}');

        expect(close).toHaveBeenCalledOnce();
    });

    it('does not close when the user clicks inside the dialog', async () => {
        const user = userEvent.setup();
        const close = vi.fn();
        render(
            <Modal title="Edit card" close={close}>
                Card fields
            </Modal>,
        );

        await user.click(screen.getByRole('dialog'));

        expect(close).not.toHaveBeenCalled();
    });
});

describe('ConfirmArchiveDialog', () => {
    it('archives the item before closing', async () => {
        const user = userEvent.setup();
        const events: string[] = [];
        render(
            <ConfirmArchiveDialog
                itemLabel="deck"
                itemName="World Capitals"
                onConfirm={async () => {
                    events.push('archived');
                }}
                close={() => events.push('closed')}
            />,
        );

        await user.click(screen.getByRole('button', { name: 'Archive deck' }));

        expect(events).toEqual(['archived', 'closed']);
    });
});
