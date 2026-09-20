import { BookOpen, CalendarCheck, Check, Play, Plus, Sparkles } from 'lucide-react';
import type { Card, Deck, User } from '../types';

export function DashboardScreen({
    user,
    decks,
    dueCards,
    goToDeck,
    startLearning,
    onCreateDeck,
}: {
    user: User;
    decks: Deck[];
    dueCards: Card[];
    goToDeck: (deckId: number) => void;
    startLearning: (deckId: number | null) => void;
    onCreateDeck: () => void;
}) {
    const firstName = user.name.trim().split(/\s+/)[0] ?? user.name;
    const dueCountFor = (deckId: number) =>
        dueCards.filter((card) => card.deck_id === deckId).length;
    return (
        <div>
            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-moss sm:mb-2 sm:gap-2 sm:text-xs sm:tracking-[.18em]">
                <Sparkles size={14} /> Overview
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
                Welcome back, {firstName}
            </h1>
            <p className="mt-1 text-sm text-ink/55 sm:mt-2 sm:max-w-2xl sm:text-base">
                Here's where things stand across your decks.
            </p>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white/85 p-3.5 shadow-sm sm:mt-7 sm:gap-4 sm:rounded-3xl sm:p-6">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <span
                        className={`grid size-10 shrink-0 place-items-center rounded-xl sm:size-12 sm:rounded-2xl ${dueCards.length ? 'bg-moss/10 text-moss' : 'bg-sage text-moss'}`}
                    >
                        {dueCards.length ? (
                            <CalendarCheck size={20} />
                        ) : (
                            <Check size={20} />
                        )}
                    </span>
                    <div className="min-w-0">
                        <p className="text-base leading-tight font-semibold tracking-tight sm:text-2xl">
                            {dueCards.length ? (
                                <>
                                    <span className="sm:hidden">
                                        {dueCards.length} card{dueCards.length === 1 ? '' : 's'} due
                                    </span>
                                    <span className="hidden sm:inline">
                                        {dueCards.length} card
                                        {dueCards.length === 1 ? '' : 's'} ready to review
                                    </span>
                                </>
                            ) : (
                                "You're caught up"
                            )}
                        </p>
                        <p className="mt-0.5 hidden text-sm text-ink/55 sm:block">
                            {dueCards.length
                                ? 'Ready for another pass across your decks.'
                                : 'No cards need review right now — check back later.'}
                        </p>
                    </div>
                </div>
                {dueCards.length > 0 && (
                    <button
                        type="button"
                        onClick={() => startLearning(null)}
                        className="shrink-0 rounded-xl bg-moss px-3 py-2 text-xs font-semibold text-white transition hover:bg-ink sm:rounded-full sm:px-5 sm:py-2.5 sm:text-sm"
                    >
                        <span className="sm:hidden">Review</span>
                        <span className="hidden sm:inline">Start learning</span>
                    </button>
                )}
            </div>
            <div className="mt-5 flex items-center justify-between sm:mt-8">
                <h2 className="font-semibold">Your decks</h2>
                <button
                    type="button"
                    onClick={onCreateDeck}
                    className="flex items-center gap-1.5 text-sm font-semibold text-moss hover:text-ink"
                >
                    <Plus size={16} /> New deck
                </button>
            </div>
            {decks.length === 0 ? (
                <div className="mt-3 rounded-2xl border border-dashed border-ink/20 p-7 text-center sm:mt-4 sm:rounded-3xl sm:p-12">
                    <BookOpen className="mx-auto text-moss" />
                    <p className="mt-3 font-semibold">No decks yet</p>
                    <p className="mt-1 text-sm text-ink/50">
                        Create your first deck to start adding cards.
                    </p>
                </div>
            ) : (
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:mt-4 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
                    {decks.map((item) => {
                        const due = dueCountFor(item.id);
                        return (
                            <div
                                key={item.id}
                                className="grid gap-3 rounded-2xl border border-ink/10 bg-white/85 p-3.5 shadow-sm sm:gap-4 sm:p-5"
                            >
                                <div className="min-w-0">
                                    <p className="font-semibold break-words sm:truncate">{item.name}</p>
                                    <p className="mt-1 text-xs text-ink/45">
                                        {item.cards_count ?? 0} cards
                                        {due ? ` · ${due} due` : ''}
                                    </p>
                                    {item.description && (
                                        <p className="mt-2 text-sm leading-5 break-words text-ink/55 sm:truncate">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => goToDeck(item.id)}
                                        aria-label={`View ${item.name}`}
                                        className="rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/70 hover:border-moss hover:text-moss sm:flex-1 sm:rounded-xl sm:py-2 sm:text-sm"
                                    >
                                        View deck
                                    </button>
                                    {due > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => startLearning(item.id)}
                                            className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-moss px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-ink sm:flex-1 sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm"
                                        >
                                            <Play size={14} />
                                            <span className="sm:hidden">Start</span>
                                            <span className="hidden sm:inline">Start now</span>
                                            <span className="grid size-4 min-w-4 place-items-center rounded-full bg-coral text-[9px] leading-none font-bold text-white">
                                                {due > 9 ? '9+' : due}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
