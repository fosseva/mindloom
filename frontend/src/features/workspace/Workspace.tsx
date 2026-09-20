import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Brain, Clock3, LayoutDashboard } from 'lucide-react';
import { ApiError, api } from '../../services/apiClient';
import type { Card, Deck, User } from '../../types';

import type { Screen } from '../../app/router';
import { authenticatedScreenFromPath, pushScreen } from '../../app/router';
import { ConfirmArchiveDialog } from '../../components/Modal';
import { DashboardScreen } from '../../pages/DashboardPage';
import { DecksScreen } from '../../pages/DecksPage';
import { LearnScreen } from '../../pages/LearnPage';
import { ProfileScreen } from '../../pages/ProfilePage';
import { AccountMenu } from '../auth/AccountMenu';
import { CardForm } from '../cards/CardForm';
import { cardHeading } from '../cards/CardDisplay';
import { DeckForm } from '../decks/DeckForm';

const NAV_ITEMS: { key: Screen; label: string; icon: typeof Clock3 }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'decks', label: 'Decks', icon: BookOpen },
    { key: 'learn', label: 'Learn', icon: Clock3 },
];

export function Workspace({
    user,
    loggedOut,
    userUpdated,
}: {
    user: User;
    loggedOut: () => void;
    userUpdated: (user: User) => void;
}) {
    const [screen, setScreen] = useState<Screen>(authenticatedScreenFromPath());
    const [decks, setDecks] = useState<Deck[]>([]);
    const [deckSearchResults, setDeckSearchResults] = useState<Deck[]>([]);
    const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
    const [deckCards, setDeckCards] = useState<Card[]>([]);
    const [dueCards, setDueCards] = useState<Card[]>([]);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [learningDeckId, setLearningDeckId] = useState<number | null>(null);
    const [learningIndex, setLearningIndex] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showDeckForm, setShowDeckForm] = useState(false);
    const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
    const [showCardForm, setShowCardForm] = useState(false);
    const [editingCard, setEditingCard] = useState<Card | null>(null);
    const [archivedDecks, setArchivedDecks] = useState<Deck[]>([]);
    const [archivedDecksTotal, setArchivedDecksTotal] = useState(0);
    const [showArchivedDecks, setShowArchivedDecks] = useState(false);
    const [archivedDeckCards, setArchivedDeckCards] = useState<Card[]>([]);
    const [showArchivedCards, setShowArchivedCards] = useState(false);
    const [archivingDeck, setArchivingDeck] = useState<Deck | null>(null);
    const [archivingCard, setArchivingCard] = useState<Card | null>(null);
    const hasLoadedDecks = useRef(false);
    const deckSearchRequestId = useRef(0);
    const selectedDeck = useMemo(
        () => decks.find((item) => item.id === selectedDeckId),
        [decks, selectedDeckId],
    );
    const learningDeck = useMemo(
        () => decks.find((item) => item.id === learningDeckId),
        [decks, learningDeckId],
    );
    const learningQueue = useMemo(
        () =>
            learningDeckId ? dueCards.filter((card) => card.deck_id === learningDeckId) : dueCards,
        [dueCards, learningDeckId],
    );

    const goTo = (next: Screen) => {
        setScreen(next);
        pushScreen(next);
    };
    const startLearning = (deckId: number | null) => {
        setLearningDeckId(deckId);
        setLearningIndex(0);
        goTo('learn');
    };

    useEffect(() => {
        const onPopState = () => setScreen(authenticatedScreenFromPath());
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    const handleError = (reason: unknown) => {
        if (reason instanceof ApiError && reason.status === 401) return loggedOut();
        setError(reason instanceof Error ? reason.message : 'Something went wrong.');
    };
    const fetchDecks = async (deckSearch = search, preferredDeckId?: number) => {
        const result = await api.decks(deckSearch);
        setDecks(result.data);
        setSelectedDeckId((current) =>
            preferredDeckId && result.data.some((item) => item.id === preferredDeckId)
                ? preferredDeckId
                : result.data.some((item) => item.id === current)
                  ? current
                  : (result.data[0]?.id ?? null),
        );
    };
    const loadDecks = async (deckSearch = search) => {
        const requestId = ++deckSearchRequestId.current;

        try {
            if (!hasLoadedDecks.current) setLoading(true);

            const result = await api.decks(deckSearch);
            if (requestId !== deckSearchRequestId.current) return;

            if (deckSearch) {
                setDeckSearchResults(result.data);
            } else {
                setDecks(result.data);
                setSelectedDeckId((current) =>
                    result.data.some((item) => item.id === current)
                        ? current
                        : (result.data[0]?.id ?? null),
                );
            }
            setError('');
        } catch (reason) {
            if (requestId !== deckSearchRequestId.current) return;
            handleError(reason);
        } finally {
            if (requestId === deckSearchRequestId.current) {
                hasLoadedDecks.current = true;
                setLoading(false);
            }
        }
    };
    const loadDeckCards = async () => {
        try {
            const result = selectedDeckId ? await api.cards(selectedDeckId, type) : null;
            setDeckCards(result?.data ?? []);
            setError('');
        } catch (reason) {
            handleError(reason);
        }
    };
    const loadDueCards = async () => {
        try {
            const result = await api.due();
            setDueCards(result.data);
            setLearningIndex(0);
            setError('');
        } catch (reason) {
            handleError(reason);
        }
    };
    const refreshAfterCardChange = async () => {
        try {
            await fetchDecks();
            setError('');
        } catch (reason) {
            handleError(reason);
        }
        await Promise.all([loadDeckCards(), loadDueCards()]);
        if (showArchivedCards) void loadArchivedDeckCards();
    };
    const selectCreatedDeck = async (deck: Deck) => {
        setSearch('');

        try {
            await fetchDecks('', deck.id);
            setError('');
        } catch (reason) {
            handleError(reason);
        }
    };
    const loadArchivedDecksTotal = async (deckSearch = search) => {
        try {
            const result = await api.decks(deckSearch, true, 1);
            setArchivedDecksTotal(result.meta.total);
        } catch (reason) {
            handleError(reason);
        }
    };
    const loadArchivedDecks = async () => {
        try {
            const result = await api.decks(search, true);
            setArchivedDecks(result.data);
            setArchivedDecksTotal(result.meta.total);
        } catch (reason) {
            handleError(reason);
        }
    };
    const loadArchivedDeckCards = async () => {
        try {
            const result = selectedDeckId ? await api.cards(selectedDeckId, type, true) : null;
            setArchivedDeckCards(result?.data ?? []);
        } catch (reason) {
            handleError(reason);
        }
    };
    const toggleArchivedDecks = () => {
        setShowArchivedDecks((current) => {
            if (!current) void loadArchivedDecks();
            return !current;
        });
    };
    const toggleArchivedCards = () => {
        setShowArchivedCards((current) => {
            if (!current) void loadArchivedDeckCards();
            return !current;
        });
    };
    const restoreDeck = async (deck: Deck) => {
        await api.updateDeck(deck.id, { archived_at: null });
        await Promise.all([fetchDecks(), loadArchivedDecks()]);
    };
    const restoreCard = async (card: Card) => {
        await api.updateCard(card.id, { archived_at: null });
        await Promise.all([fetchDecks(), loadDeckCards(), loadDueCards(), loadArchivedDeckCards()]);
    };
    const archiveDeck = async (deck: Deck) => {
        await api.updateDeck(deck.id, { archived_at: new Date().toISOString() });
        await Promise.all([
            fetchDecks(),
            showArchivedDecks ? loadArchivedDecks() : loadArchivedDecksTotal(),
        ]);
    };
    const archiveCard = async (card: Card) => {
        await api.updateCard(card.id, { archived_at: new Date().toISOString() });
        await Promise.all([fetchDecks(), loadDeckCards(), loadDueCards()]);
        if (showArchivedCards) void loadArchivedDeckCards();
    };
    useEffect(() => {
        const timeout = window.setTimeout(
            () => {
                void loadDecks(search);
                void loadArchivedDecksTotal(search);
            },
            search ? 250 : 0,
        );

        return () => window.clearTimeout(timeout);
    }, [search]);
    useEffect(() => {
        if (screen === 'decks') void loadDeckCards();
    }, [screen, selectedDeckId, type]);
    useEffect(() => {
        void loadDueCards();
    }, [screen]);
    useEffect(() => {
        setShowArchivedCards(false);
        setArchivedDeckCards([]);
    }, [selectedDeckId]);

    return (
        <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,_#fffdf5,_#f4f1e8_45%,_#e4ece2)]">
            <header className="sticky top-0 z-10 border-b border-ink/10 bg-paper/90 backdrop-blur md:static md:bg-paper/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-5 sm:py-4">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-moss text-white sm:size-10 sm:rounded-2xl">
                            <Brain size={20} />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-base font-semibold tracking-tight sm:text-lg">
                                Mindloom
                            </p>
                            <p className="hidden text-xs text-ink/55 sm:block">
                                Working knowledge, practiced
                            </p>
                        </div>
                    </div>
                    <nav className="hidden items-center gap-1 rounded-full bg-white/70 p-1 md:flex">
                        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => goTo(key)}
                                aria-current={screen === key ? 'page' : undefined}
                                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${screen === key ? 'bg-ink text-white' : 'text-ink/55 hover:bg-sage/70'}`}
                            >
                                <Icon size={15} className="shrink-0" />
                                <span className="hidden sm:inline">{label}</span>
                                {key === 'learn' && dueCards.length > 0 && (
                                    <span
                                        aria-label={`${dueCards.length} pending`}
                                        className="grid size-4 min-w-4 shrink-0 place-items-center rounded-full bg-coral px-0.5 text-[9px] leading-none font-bold text-white"
                                    >
                                        {dueCards.length > 9 ? '9+' : dueCards.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                    <div className="flex shrink-0 items-center gap-2">
                        <AccountMenu
                            user={user}
                            loggedOut={loggedOut}
                            openProfile={() => goTo('profile')}
                        />
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-3 pt-4 pb-24 sm:px-5 sm:pt-7 md:py-8">
                {error && (
                    <p
                        role="alert"
                        className="mb-5 rounded-2xl border border-coral/30 bg-coral/10 p-4 text-sm text-coral"
                    >
                        {error}
                    </p>
                )}
                {loading ? (
                    <p className="text-ink/50">Loading your learning space…</p>
                ) : screen === 'dashboard' ? (
                    <DashboardScreen
                        user={user}
                        decks={decks}
                        dueCards={dueCards}
                        goToDeck={(deckId) => {
                            setSelectedDeckId(deckId);
                            goTo('decks');
                        }}
                        startLearning={startLearning}
                        onCreateDeck={() => setShowDeckForm(true)}
                    />
                ) : screen === 'decks' ? (
                    <DecksScreen
                        decks={search ? deckSearchResults : decks}
                        selectedDeck={selectedDeck}
                        dueCards={dueCards}
                        selectedDeckId={selectedDeckId}
                        onSelectDeck={(deck) => {
                            setDecks((current) =>
                                current.some((item) => item.id === deck.id)
                                    ? current
                                    : [...current, deck],
                            );
                            setSelectedDeckId(deck.id);
                        }}
                        search={search}
                        setSearch={setSearch}
                        type={type}
                        setType={setType}
                        cards={deckCards}
                        onCreateDeck={() => setShowDeckForm(true)}
                        onEditDeck={setEditingDeck}
                        onArchiveDeck={setArchivingDeck}
                        onStartLearning={startLearning}
                        onNewCard={() => setShowCardForm(true)}
                        onEditCard={setEditingCard}
                        onArchiveCard={setArchivingCard}
                        archivedDecks={archivedDecks}
                        archivedDecksTotal={archivedDecksTotal}
                        showArchivedDecks={showArchivedDecks}
                        onToggleArchivedDecks={toggleArchivedDecks}
                        onRestoreDeck={restoreDeck}
                        archivedCards={archivedDeckCards}
                        showArchivedCards={showArchivedCards}
                        onToggleArchivedCards={toggleArchivedCards}
                        onRestoreCard={restoreCard}
                    />
                ) : screen === 'learn' ? (
                    <LearnScreen
                        deckName={learningDeck?.name}
                        cards={learningQueue}
                        index={learningIndex}
                        onAdvance={() => setLearningIndex((current) => current + 1)}
                        onShowAll={() => setLearningDeckId(null)}
                    />
                ) : (
                    <ProfileScreen user={user} userUpdated={userUpdated} />
                )}
            </main>
            <nav
                aria-label="Primary navigation"
                className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/10 bg-white/95 px-2 pt-1.5 pb-[max(.375rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(23,35,31,.08)] backdrop-blur md:hidden"
            >
                <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
                    {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => goTo(key)}
                            aria-current={screen === key ? 'page' : undefined}
                            className={`relative flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-[11px] font-semibold transition ${screen === key ? 'bg-sage text-moss' : 'text-ink/50 active:bg-sage/60'}`}
                        >
                            <Icon size={19} strokeWidth={screen === key ? 2.5 : 2} />
                            <span>{label}</span>
                            {key === 'learn' && dueCards.length > 0 && (
                                <span
                                    aria-label={`${dueCards.length} pending`}
                                    className="absolute top-1.5 left-[calc(50%+7px)] grid size-4 min-w-4 place-items-center rounded-full bg-coral px-0.5 text-[9px] leading-none font-bold text-white ring-2 ring-white"
                                >
                                    {dueCards.length > 9 ? '9+' : dueCards.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </nav>
            {showDeckForm && (
                <DeckForm close={() => setShowDeckForm(false)} saved={selectCreatedDeck} />
            )}
            {editingDeck && (
                <DeckForm
                    existing={editingDeck}
                    close={() => setEditingDeck(null)}
                    saved={() => loadDecks()}
                />
            )}
            {showCardForm && selectedDeck && (
                <CardForm
                    deck={selectedDeck}
                    close={() => setShowCardForm(false)}
                    saved={refreshAfterCardChange}
                />
            )}
            {editingCard && selectedDeck && (
                <CardForm
                    deck={selectedDeck}
                    existing={editingCard}
                    close={() => setEditingCard(null)}
                    saved={refreshAfterCardChange}
                />
            )}
            {archivingDeck && (
                <ConfirmArchiveDialog
                    itemLabel="deck"
                    itemName={archivingDeck.name}
                    close={() => setArchivingDeck(null)}
                    onConfirm={() => archiveDeck(archivingDeck)}
                />
            )}
            {archivingCard && (
                <ConfirmArchiveDialog
                    itemLabel="card"
                    itemName={cardHeading(archivingCard)}
                    close={() => setArchivingCard(null)}
                    onConfirm={() => archiveCard(archivingCard)}
                />
            )}
        </div>
    );
}
