import { useEffect, useRef, useState } from 'react';
import type { Card } from '../types';

import { EmptyCards, LearningCard } from '../features/cards/CardDisplay';

export function LearnScreen({
    deckName,
    cards,
    index,
    onAdvance,
    onShowAll,
}: {
    deckName?: string;
    cards: Card[];
    index: number;
    onAdvance: () => void;
    onShowAll: () => void;
}) {
    const finished = index >= cards.length;
    const card = cards[index];
    const progress = cards.length ? (index / cards.length) * 100 : 0;
    const [showConfetti, setShowConfetti] = useState(false);
    const wasFinished = useRef(finished);
    useEffect(() => {
        if (finished && !wasFinished.current && cards.length > 0) {
            setShowConfetti(true);
            const timeout = setTimeout(() => setShowConfetti(false), 2800);
            wasFinished.current = finished;
            return () => clearTimeout(timeout);
        }
        wasFinished.current = finished;
    }, [finished, cards.length]);
    return (
        <div className="mx-auto max-w-2xl">
            {showConfetti && <Confetti />}
            <div className="flex items-center justify-between gap-3">
                <h1 className="truncate text-lg font-semibold tracking-tight text-ink/70">
                    {deckName ?? 'Due for review'}
                </h1>
                {!finished && (
                    <span className="shrink-0 text-xs font-bold text-ink/40">
                        {index + 1} / {cards.length}
                    </span>
                )}
            </div>
            {deckName && (
                <button
                    type="button"
                    onClick={onShowAll}
                    className="mt-1 text-xs font-semibold text-moss underline decoration-moss/40 underline-offset-4"
                >
                    Show due cards from all decks
                </button>
            )}
            {!finished && (
                <div className="mt-3 mb-5 h-1 overflow-hidden rounded-full bg-sage/60">
                    <div
                        className="h-full rounded-full bg-moss transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
            {finished || !card ? (
                <EmptyCards due celebrate={showConfetti} />
            ) : (
                <LearningCard key={card.id} card={card} reviewed={async () => onAdvance()} />
            )}
        </div>
    );
}

const CONFETTI_COLORS = [
    '#315c49',
    '#d96c4c',
    '#c9922f',
    '#e6b800',
    '#4f86c6',
    '#dce7dd',
    '#e0607e',
];

function Confetti() {
    const pieces = Array.from({ length: 70 }, (_, i) => {
        const left = 50 + (Math.random() - 0.5) * 90;
        const drift = (Math.random() - 0.5) * 320;
        const size = 6 + Math.random() * 8;
        return {
            id: i,
            left,
            drift,
            size,
            round: i % 3 === 0,
            color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            delay: Math.random() * 0.35,
            duration: 1.8 + Math.random() * 1.2,
            spin: 360 + Math.random() * 540,
        };
    });
    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
            {pieces.map((piece) => (
                <span
                    key={piece.id}
                    className={`animate-confetti-fall absolute top-0 shadow-sm ${piece.round ? 'rounded-full' : 'rounded-sm'}`}
                    style={{
                        left: `${piece.left}%`,
                        width: `${piece.size}px`,
                        height: `${piece.round ? piece.size : piece.size * 1.7}px`,
                        backgroundColor: piece.color,
                        animationDelay: `${piece.delay}s`,
                        animationDuration: `${piece.duration}s`,
                        ['--confetti-drift' as string]: `${piece.drift}px`,
                        ['--confetti-spin' as string]: `${piece.spin}deg`,
                    }}
                />
            ))}
        </div>
    );
}
