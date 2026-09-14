import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Brain, Clock3, LayoutDashboard } from 'lucide-react';
import { ApiError, api } from '../../services/apiClient';
import type { Card, Deck, User } from '../../types';

import type { Screen } from '../../app/router';
import { authenticatedScreenFromPath, pushScreen } from '../../app/router';
import { ConfirmArchiveDialog } from '../../components/Modal';
import { DashboardScreen } from '../../pages/DashboardPage';
import { DecksScreen } from '../../pages/DecksPage';
import { PracticeScreen } from '../../pages/PracticePage';
import { AccountMenu } from '../auth/AccountMenu';
import { CardForm } from '../cards/CardForm';
import { cardHeading } from '../cards/CardDisplay';
import { DeckForm } from '../decks/DeckForm';

const NAV_ITEMS: { key: Screen; label: string; icon: typeof Clock3 }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'decks', label: 'Decks', icon: BookOpen },
    { key: 'practice', label: 'Practice', icon: Clock3 },
];

export function Workspace({ user, loggedOut }: { user: User; loggedOut: () => void }) {
    const [screen, setScreen] = useState<Screen>(authenticatedScreenFromPath());
    const [decks, setDecks] = useState<Deck[]>([]);
    const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
    const [deckCards, setDeckCards] = useState<Card[]>([]);
    const [dueCards, setDueCards] = useState<Card[]>([]);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [practiceDeckId, setPracticeDeckId] = useState<number | null>(null);
    const [practiceIndex, setPracticeIndex] = useState(0);
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
    const selectedDeck = useMemo(
        () => decks.find((item) => item.id === selectedDeckId),
        [decks, selectedDeckId],
    );
    const practiceDeck = useMemo(
        () => decks.find((item) => item.id === practiceDeckId),
        [decks, practiceDeckId],
    );
    const practiceQueue = useMemo(
        () =>
            practiceDeckId ? dueCards.filter((card) => card.deck_id === practiceDeckId) : dueCards,
        [dueCards, practiceDeckId],
    );

    const goTo = (next: Screen) => {
        setScreen(next);
        pushScreen(next);
    };
    const startPractice = (deckId: number | null) => {
        setPracticeDeckId(deckId);
        setPracticeIndex(0);
        goTo('practice');
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
    const loadDecks = async () => {
        try {
            setLoading(true);
            await fetchDecks();
            setError('');
        } catch (reason) {
            handleError(reason);
        } finally {
            setLoading(false);
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
            setPracticeIndex(0);
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
    const loadArchivedDecksTotal = async () => {
        try {
            const result = await api.decks(search, true, 1);
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
        void loadDecks();
        void loadArchivedDecksTotal();
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
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fffdf5,_#f4f1e8_45%,_#e4ece2)]">
            <header className="border-b border-ink/10 bg-paper/80 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-moss text-white sm:size-10">
                            <Brain size={20} />
                        </span>
                        <div className="hidden min-w-0 sm:block">
                            <p className="truncate text-lg font-semibold tracking-tight">
                                Mindloom
                            </p>
                            <p className="text-xs text-ink/55">Working knowledge, practiced</p>
                        </div>
                    </div>
                    <nav className="flex items-center gap-1 rounded-full bg-white/70 p-1">
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
                                {key === 'practice' && dueCards.length > 0 && (
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
                        <AccountMenu user={user} loggedOut={loggedOut} />
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-8">
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
                        startPractice={startPractice}
                        onCreateDeck={() => setShowDeckForm(true)}
                    />
                ) : screen === 'decks' ? (
                    <DecksScreen
                        decks={decks}
                        dueCards={dueCards}
                        selectedDeckId={selectedDeckId}
                        onSelectDeck={setSelectedDeckId}
                        search={search}
                        setSearch={setSearch}
                        type={type}
                        setType={setType}
                        cards={deckCards}
                        onCreateDeck={() => setShowDeckForm(true)}
                        onEditDeck={setEditingDeck}
                        onArchiveDeck={setArchivingDeck}
                        onStartPractice={startPractice}
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
                ) : (
                    <PracticeScreen
                        deckName={practiceDeck?.name}
                        cards={practiceQueue}
                        index={practiceIndex}
                        onAdvance={() => setPracticeIndex((current) => current + 1)}
                        onShowAll={() => setPracticeDeckId(null)}
                    />
                )}
            </main>
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
