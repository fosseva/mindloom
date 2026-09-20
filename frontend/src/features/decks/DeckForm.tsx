import { useState } from 'react';
import { api } from '../../services/apiClient';
import type { Deck } from '../../types';

import { Field } from '../../components/Field';
import { Modal } from '../../components/Modal';

export function DeckForm({
    existing,
    close,
    saved,
}: {
    existing?: Deck;
    close: () => void;
    saved: (deck: Deck) => Promise<void>;
}) {
    const [name, setName] = useState(existing?.name ?? '');
    const [description, setDescription] = useState(existing?.description ?? '');
    return (
        <Modal
            title={existing ? `Edit ${existing.name}` : 'Create a deck'}
            subtitle={
                existing
                    ? "Update this deck's name or description."
                    : 'A home for a focused set of cards.'
            }
            close={close}
        >
            <form
                className="grid gap-3.5"
                onSubmit={async (event) => {
                    event.preventDefault();
                    const result = existing
                        ? await api.updateDeck(existing.id, {
                              name,
                              description: description || null,
                          })
                        : await api.createDeck({
                              name,
                              description: description || undefined,
                          });
                    await saved(result.data);
                    close();
                }}
            >
                <Field
                    label="Name"
                    value={name}
                    setValue={setName}
                    required
                    placeholder="e.g. World Capitals"
                    autoFocus
                />
                <Field
                    label="Description"
                    value={description}
                    setValue={setDescription}
                    multiline
                    placeholder="Optional"
                />
                <button className="mt-1 rounded-xl bg-moss p-2.5 text-sm font-semibold text-white hover:bg-ink">
                    {existing ? 'Save changes' : 'Create deck'}
                </button>
            </form>
        </Modal>
    );
}
