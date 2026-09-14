import {
    Archive,
    ArchiveRestore,
    ChevronRight,
    Pencil,
    Play,
    Plus,
    Search,
    Sparkles,
} from 'lucide-react';
import type { Card, Deck } from '../types';

import { cardTypeLabels } from '../features/cards/cardConfig';
import { CardListItem, EmptyCards } from '../features/cards/CardDisplay';

export function DecksScreen({
    decks,
    dueCards,
    selectedDeckId,
    onSelectDeck,
    search,
    setSearch,
    type,
    setType,
    cards,
    onCreateDeck,
    onEditDeck,
    onArchiveDeck,
    onStartLearning,
    onNewCard,
    onEditCard,
    onArchiveCard,
    archivedDecks,
    archivedDecksTotal,
    showArchivedDecks,
    onToggleArchivedDecks,
    onRestoreDeck,
    archivedCards,
    showArchivedCards,
    onToggleArchivedCards,
    onRestoreCard,
}: {
    decks: Deck[];
    dueCards: Card[];
    selectedDeckId: number | null;
    onSelectDeck: (deckId: number) => void;
    search: string;
    setSearch: (value: string) => void;
    type: string;
    setType: (value: string) => void;
    cards: Card[];
    onCreateDeck: () => void;
    onEditDeck: (deck: Deck) => void;
    onArchiveDeck: (deck: Deck) => void;
    onStartLearning: (deckId: number) => void;
    onNewCard: () => void;
    onEditCard: (card: Card) => void;
    onArchiveCard: (card: Card) => void;
    archivedDecks: Deck[];
    archivedDecksTotal: number;
    showArchivedDecks: boolean;
    onToggleArchivedDecks: () => void;
    onRestoreDeck: (deck: Deck) => void;
    archivedCards: Card[];
    showArchivedCards: boolean;
    onToggleArchivedCards: () => void;
    onRestoreCard: (card: Card) => void;
}) {
    const deck = decks.find((item) => item.id === selectedDeckId);
    const dueCountFor = (deckId: number) =>
        dueCards.filter((card) => card.deck_id === deckId).length;
    const deckDue = deck ? dueCountFor(deck.id) : 0;
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[290px_1fr]">
            <aside className="min-w-0 self-start rounded-3xl border border-ink/10 bg-white/70 p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold">Your decks</h2>
                    <button
                        type="button"
                        onClick={onCreateDeck}
                        aria-label="Create deck"
                        className="rounded-full p-2 hover:bg-sage"
                    >
                        <Plus size={17} />
                    </button>
                </div>
                <label className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2">
                    <Search size={16} className="text-ink/40" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Filter decks"
                        className="w-full bg-transparent text-sm outline-none"
                    />
                </label>
                <div className="mt-4 grid gap-1">
                    {decks.map((item) => {
                        const active = selectedDeckId === item.id;
                        const due = dueCountFor(item.id);
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onSelectDeck(item.id)}
                                className={`flex items-center gap-2 rounded-2xl px-3 py-3 text-left ${active ? 'bg-moss text-white' : 'hover:bg-sage/70'}`}
                            >
                                <span className="block min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold">
                                        {item.name}
                                    </span>
                                    <span
                                        className={`block truncate text-xs ${active ? 'text-white/65' : 'text-ink/45'}`}
                                    >
                                        {item.cards_count ?? 0} cards
                                    </span>
                                </span>
                                <span className="grid size-4 shrink-0 place-items-center">
                                    {due > 0 && (
                                        <span
                                            aria-label={`${due} pending`}
                                            className={`grid size-4 place-items-center rounded-full text-[9px] leading-none font-bold ${active ? 'bg-white/25 text-white' : 'bg-coral text-white'}`}
                                        >
                                            {due > 9 ? '9+' : due}
                                        </span>
                                    )}
                                </span>
                                <ChevronRight size={16} className="shrink-0" />
                            </button>
                        );
                    })}
                </div>
                <button
                    type="button"
                    onClick={onToggleArchivedDecks}
                    className="mx-auto mt-3 flex w-fit items-center gap-1 text-xs font-normal text-ink/30 hover:text-ink/55"
                >
                    <Archive size={11} />
                    {showArchivedDecks
                        ? 'Hide archived decks'
                        : `Show archived decks (${archivedDecksTotal})`}
                </button>
                {showArchivedDecks && (
                    <div className="mt-2 grid gap-1 border-t border-ink/10 pt-2">
                        {archivedDecks.length === 0 ? (
                            <p className="px-3 py-2 text-xs text-ink/40">No archived decks.</p>
                        ) : (
                            archivedDecks.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-2 rounded-2xl px-3 py-2"
                                >
                                    <span className="min-w-0 truncate text-sm text-ink/50">
                                        {item.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onRestoreDeck(item)}
                                        className="flex shrink-0 items-center gap-1 text-xs font-semibold text-moss hover:text-ink"
                                    >
                                        <ArchiveRestore size={13} /> Restore
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </aside>
            <section className="min-w-0">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div className="min-w-0">
                        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-moss">
                            <Sparkles size={14} /> Learning deck
                        </p>
                        <div className="flex flex-wrap items-center gap-1">
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                {deck?.name ?? 'Your decks'}
                            </h1>
                            {deck && (
                                <div className="flex items-center gap-0.5">
                                    <button
                                        type="button"
                                        onClick={() => onEditDeck(deck)}
                                        aria-label={`Edit ${deck.name}`}
                                        title="Edit deck"
                                        className="rounded-full p-2 text-ink/35 hover:bg-sage hover:text-ink"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onArchiveDeck(deck)}
                                        aria-label={`Archive ${deck.name}`}
                                        title="Archive deck"
                                        className="rounded-full p-2 text-ink/35 hover:bg-sage hover:text-coral"
                                    >
                                        <Archive size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="mt-2 max-w-2xl text-ink/55">
                            {deck?.description ||
                                'A focused collection of ideas worth making your own.'}
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {deck && deckDue > 0 && (
                            <button
                                type="button"
                                onClick={() => onStartLearning(deck.id)}
                                className="flex items-center gap-2 rounded-full bg-moss px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ink"
                            >
                                <Play size={15} /> Start now
                                <span className="grid size-4 min-w-4 place-items-center rounded-full bg-coral text-[9px] leading-none font-bold text-white">
                                    {deckDue > 9 ? '9+' : deckDue}
                                </span>
                            </button>
                        )}
                        <select
                            value={type}
                            onChange={(event) => setType(event.target.value)}
                            className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm"
                        >
                            <option value="">All card types</option>
                            {Object.entries(cardTypeLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={onNewCard}
                            disabled={!deck}
                            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                        >
                            <Plus size={16} /> <span className="hidden sm:inline">New card</span>
                        </button>
                    </div>
                </div>
                <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {cards.map((card) => (
                        <CardListItem
                            key={card.id}
                            card={card}
                            onEdit={() => onEditCard(card)}
                            onArchive={() => onArchiveCard(card)}
                        />
                    ))}
                </div>
                {cards.length === 0 && <EmptyCards due={false} />}
                {deck && (
                    <>
                        <button
                            type="button"
                            onClick={onToggleArchivedCards}
                            className="mx-auto mt-5 flex w-fit items-center gap-1 text-xs font-normal text-ink/30 hover:text-ink/55"
                        >
                            <Archive size={11} />
                            {showArchivedCards
                                ? 'Hide archived cards'
                                : `Show archived cards (${deck.archived_cards_count ?? 0})`}
                        </button>
                        {showArchivedCards && (
                            <div className="mt-3 grid grid-cols-1 gap-3 border-t border-ink/10 pt-4 sm:grid-cols-2">
                                {archivedCards.length === 0 ? (
                                    <p className="text-sm text-ink/40">No archived cards.</p>
                                ) : (
                                    archivedCards.map((card) => (
                                        <CardListItem
                                            key={card.id}
                                            card={card}
                                            onRestore={() => onRestoreCard(card)}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}
