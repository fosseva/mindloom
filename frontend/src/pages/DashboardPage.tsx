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
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-moss">
                <Sparkles size={14} /> Overview
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back, {firstName}
            </h1>
            <p className="mt-2 max-w-2xl text-ink/55">
                Here's where things stand across your decks.
            </p>
            <div className="mt-7 flex flex-col items-start justify-between gap-4 rounded-3xl border border-ink/10 bg-white/85 p-6 shadow-sm sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                    <span
                        className={`grid size-12 shrink-0 place-items-center rounded-2xl ${dueCards.length ? 'bg-moss/10 text-moss' : 'bg-sage text-moss'}`}
                    >
                        {dueCards.length ? <CalendarCheck size={22} /> : <Check size={22} />}
                    </span>
                    <div>
                        <p className="text-2xl font-semibold tracking-tight">
                            {dueCards.length
                                ? `${dueCards.length} card${dueCards.length === 1 ? '' : 's'} ready to review`
                                : "You're caught up"}
                        </p>
                        <p className="text-sm text-ink/55">
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
                        className="shrink-0 rounded-full bg-moss px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink"
                    >
                        Start learning
                    </button>
                )}
            </div>
            <div className="mt-8 flex items-center justify-between">
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
                <div className="mt-4 rounded-3xl border border-dashed border-ink/20 p-12 text-center">
                    <BookOpen className="mx-auto text-moss" />
                    <p className="mt-3 font-semibold">No decks yet</p>
                    <p className="mt-1 text-sm text-ink/50">
                        Create your first deck to start adding cards.
                    </p>
                </div>
            ) : (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {decks.map((item) => {
                        const due = dueCountFor(item.id);
                        return (
                            <div
                                key={item.id}
                                className="flex flex-col justify-between gap-4 rounded-2xl border border-ink/10 bg-white/85 p-5 shadow-sm"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-semibold">{item.name}</p>
                                    <p className="mt-1 text-xs text-ink/45">
                                        {item.cards_count ?? 0} cards
                                        {due ? ` · ${due} due` : ''}
                                    </p>
                                    {item.description && (
                                        <p className="mt-2 truncate text-sm text-ink/55">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => goToDeck(item.id)}
                                        className="flex-1 rounded-xl border border-ink/15 px-3 py-2 text-sm font-semibold text-ink/70 hover:border-moss hover:text-moss"
                                    >
                                        View deck
                                    </button>
                                    {due > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => startLearning(item.id)}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-moss px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ink"
                                        >
                                            <Play size={15} /> Start now
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
