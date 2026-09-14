import { useState } from 'react';
import { api } from '../../services/apiClient';
import type { Card, CardType, Deck } from '../../types';

import { Field } from '../../components/Field';
import { Modal } from '../../components/Modal';
import { cardFields, cardTypeDescriptions, cardTypeLabels } from './cardConfig';

export function CardForm({
    deck,
    existing,
    close,
    saved,
}: {
    deck: Deck;
    existing?: Card;
    close: () => void;
    saved: () => Promise<void>;
}) {
    const [type, setType] = useState<CardType>(existing?.type ?? 'remember');
    const [values, setValues] = useState<Record<string, string>>(() =>
        existing
            ? Object.fromEntries(
                  cardFields[existing.type].map((field) => [
                      field.key,
                      existing.content[field.key] ?? '',
                  ]),
              )
            : {},
    );
    return (
        <Modal
            title={
                existing
                    ? `Edit ${cardTypeLabels[existing.type].toLowerCase()} card`
                    : `Add to ${deck.name}`
            }
            subtitle={
                existing
                    ? 'Update the fields for this card.'
                    : 'Choose a card type, then fill in its fields.'
            }
            size="md"
            close={close}
        >
            <form
                className="grid gap-3.5"
                onSubmit={async (event) => {
                    event.preventDefault();
                    if (existing) {
                        await api.updateCard(existing.id, values);
                    } else {
                        await api.createCard(deck.id, { type, ...values });
                    }
                    await saved();
                    close();
                }}
            >
                {!existing && (
                    <label className="grid gap-2 text-sm font-semibold">
                        Card type
                        <select
                            value={type}
                            onChange={(event) => {
                                setType(event.target.value as CardType);
                                setValues({});
                            }}
                            className="rounded-xl border border-ink/15 bg-white p-2.5 font-normal"
                        >
                            {Object.entries(cardTypeLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        <span className="text-xs font-normal text-ink/50">
                            {cardTypeDescriptions[type]}
                        </span>
                    </label>
                )}
                {cardFields[type].map((field) => (
                    <Field
                        key={field.key}
                        label={field.label}
                        hint={field.hint}
                        value={values[field.key] ?? ''}
                        setValue={(value) =>
                            setValues((current) => ({ ...current, [field.key]: value }))
                        }
                        required={field.required}
                        placeholder={field.placeholder}
                        multiline
                    />
                ))}
                <button className="mt-1 rounded-xl bg-moss p-2.5 text-sm font-semibold text-white hover:bg-ink">
                    {existing
                        ? 'Save changes'
                        : `Create ${cardTypeLabels[type].toLowerCase()} card`}
                </button>
            </form>
        </Modal>
    );
}
