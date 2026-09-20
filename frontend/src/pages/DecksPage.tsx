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
import { useState } from 'react';
import type { Card, Deck } from '../types';

import { cardTypeLabels } from '../features/cards/cardConfig';
import { CardListItem, EmptyCards } from '../features/cards/CardDisplay';

export function DecksScreen({
    decks,
    selectedDeck,
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
    selectedDeck?: Deck;
    dueCards: Card[];
    selectedDeckId: number | null;
    onSelectDeck: (deck: Deck) => void;
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
    const [showDeckPicker, setShowDeckPicker] = useState(false);
    const deck = selectedDeck;
    const dueCountFor = (deckId: number) =>
        dueCards.filter((card) => card.deck_id === deckId).length;
    const deckDue = deck ? dueCountFor(deck.id) : 0;
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[290px_1fr]">
            <aside className="min-w-0 self-start rounded-2xl border border-ink/10 bg-white/70 p-3 shadow-sm sm:rounded-3xl sm:p-4">
                <div className="mb-2.5 flex items-center justify-between sm:mb-4">
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
                <label className="hidden items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 lg:flex">
                    <Search size={16} className="text-ink/40" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Filter decks"
                        className="w-full bg-transparent text-sm outline-none"
                    />
                </label>
                <div className="lg:hidden">
                    <p className="mb-1.5 text-xs font-semibold text-ink/55">Switch deck</p>
                    <button
                        type="button"
                        onClick={() => setShowDeckPicker((current) => !current)}
                        aria-expanded={showDeckPicker}
                        className="flex w-full items-center gap-2 rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-left text-sm font-semibold text-ink"
                    >
                        <span className="min-w-0 flex-1 truncate">
                            {deck?.name ?? 'Choose a deck'}
                        </span>
                        <Search size={15} className="shrink-0 text-ink/35" />
                    </button>
                    {showDeckPicker && (
                        <div className="mt-2 rounded-xl border border-ink/10 bg-white p-2 shadow-lg">
                            <label className="flex items-center gap-2 rounded-lg bg-paper/70 px-2.5 py-2">
                                <Search size={15} className="shrink-0 text-ink/35" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search decks"
                                    autoFocus
                                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                                />
                            </label>
                            <div className="mt-1.5 grid max-h-48 gap-1 overflow-y-auto">
                                {decks.length === 0 ? (
                                    <p className="px-2.5 py-3 text-center text-xs text-ink/40">
                                        No decks found
                                    </p>
                                ) : (
                                    decks.map((item) => {
                                        const due = dueCountFor(item.id);

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => {
                                                    onSelectDeck(item);
                                                    setSearch('');
                                                    setShowDeckPicker(false);
                                                }}
                                                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left ${selectedDeckId === item.id ? 'bg-sage text-moss' : 'hover:bg-paper'}`}
                                            >
                                                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                                                    {item.name}
                                                </span>
                                                <span className="shrink-0 text-[11px] text-current/55">
                                                    {item.cards_count ?? 0} cards
                                                    {due > 0 ? ` · ${due} due` : ''}
                                                </span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-4 hidden gap-1 lg:grid">
                    {decks.map((item) => {
                        const active = selectedDeckId === item.id;
                        const due = dueCountFor(item.id);
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onSelectDeck(item)}
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
                    aria-expanded={showArchivedDecks}
                    aria-label={showArchivedDecks ? 'Hide archived decks' : 'Show archived decks'}
                    className="mx-auto mt-1 flex min-h-8 w-fit items-center gap-1 px-2 text-[11px] leading-none font-medium text-ink/35 transition hover:text-ink/55 lg:mt-3 lg:min-h-0 lg:px-0 lg:text-xs lg:leading-normal lg:font-normal lg:text-ink/30"
                >
                    <Archive size={11} className="hidden lg:block" />
                    {showArchivedDecks
                        ? 'Hide archived decks'
                        : `Show archived decks (${archivedDecksTotal})`}
                </button>
                {showArchivedDecks && (
                    <div className="mt-2 grid gap-1 border-t border-ink/10 pt-2">
                        {archivedDecks.length === 0 ? (
                            <p className="px-3 py-2 text-center text-[11px] font-medium text-ink/35 lg:text-xs lg:font-normal lg:text-ink/40">
                                No archived decks.
                            </p>
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
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
                    <div className="min-w-0">
                        <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-moss sm:mb-2 sm:gap-2 sm:text-xs sm:tracking-[.18em]">
                            <Sparkles size={14} /> Learning deck
                        </p>
                        <div className="flex items-start justify-between gap-2 sm:justify-start sm:gap-1">
                            <h1 className="min-w-0 text-2xl leading-tight font-semibold tracking-tight break-words sm:text-4xl sm:leading-none">
                                {deck?.name ?? 'Your decks'}
                            </h1>
                            {deck && (
                                <div className="mt-0.5 flex shrink-0 items-center gap-0.5 sm:mt-0">
                                    <button
                                        type="button"
                                        onClick={() => onEditDeck(deck)}
                                        aria-label={`Edit ${deck.name}`}
                                        title="Edit deck"
                                        className="grid size-8 place-items-center rounded-full text-ink/35 transition hover:bg-sage hover:text-ink sm:size-9"
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onArchiveDeck(deck)}
                                        aria-label={`Archive ${deck.name}`}
                                        title="Archive deck"
                                        className="grid size-8 place-items-center rounded-full text-ink/35 transition hover:bg-sage hover:text-coral sm:size-9"
                                    >
                                        <Archive size={15} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-ink/55 sm:mt-2 sm:text-base">
                            {deck?.description ||
                                'A focused collection of ideas worth making your own.'}
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        {deck && deckDue > 0 && (
                            <button
                                type="button"
                                onClick={() => onStartLearning(deck.id)}
                                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-moss px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-ink sm:gap-2 sm:rounded-full sm:px-4 sm:py-2 sm:text-sm"
                            >
                                <Play size={14} />
                                <span className="sm:hidden">Start</span>
                                <span className="hidden sm:inline">Start now</span>
                                <span className="grid size-4 min-w-4 place-items-center rounded-full bg-coral text-[9px] leading-none font-bold text-white">
                                    {deckDue > 9 ? '9+' : deckDue}
                                </span>
                            </button>
                        )}
                        <select
                            value={type}
                            onChange={(event) => setType(event.target.value)}
                            aria-label="Filter by card type"
                            className="min-w-0 flex-1 rounded-xl border border-ink/15 bg-white px-2.5 py-2 text-xs sm:flex-none sm:px-3 sm:text-sm"
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
                            className="flex shrink-0 items-center gap-2 rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white disabled:opacity-40 sm:rounded-full sm:px-4"
                        >
                            <Plus size={16} /> <span className="hidden sm:inline">New card</span>
                        </button>
                    </div>
                </div>
                <section className="mt-5 border-t border-ink/10 pt-5 sm:mt-7 sm:border-0 sm:pt-0">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-1 xl:grid-cols-2">
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
                </section>
                {deck && (
                    <>
                        <button
                            type="button"
                            onClick={onToggleArchivedCards}
                            aria-expanded={showArchivedCards}
                            aria-label={
                                showArchivedCards ? 'Hide archived cards' : 'Show archived cards'
                            }
                            className="mx-auto mt-4 flex min-h-8 w-fit items-center gap-1 px-2 text-[11px] leading-none font-medium text-ink/35 transition hover:text-ink/55 lg:mt-5 lg:min-h-0 lg:px-0 lg:text-xs lg:leading-normal lg:font-normal lg:text-ink/30"
                        >
                            <Archive size={11} className="hidden lg:block" />
                            {showArchivedCards
                                ? 'Hide archived cards'
                                : `Show archived cards (${deck.archived_cards_count ?? 0})`}
                        </button>
                        {showArchivedCards && (
                            <div className="mt-3 grid grid-cols-1 gap-3 border-t border-ink/10 pt-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                {archivedCards.length === 0 ? (
                                    <p className="text-center text-[11px] font-medium text-ink/35 sm:col-span-2 lg:col-span-1 lg:text-xs lg:font-normal lg:text-ink/40 xl:col-span-2">
                                        No archived cards.
                                    </p>
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
