import { useEffect, useState } from 'react';
import { Archive, ArchiveRestore, BookOpen, Check, Pencil } from 'lucide-react';
import { api } from '../../services/apiClient';
import type { Card, CardReview, CardType, Learning } from '../../types';
import { cardTypeLabels } from './cardConfig';
const learningStateInfo: Record<string, { label: string; dot: string; text: string }> = {
    new: { label: 'Not started', dot: 'bg-ink/30', text: 'text-ink/45' },
    learning: { label: 'Still learning', dot: 'bg-amber', text: 'text-amber' },
    reviewing: { label: 'On track', dot: 'bg-moss', text: 'text-moss' },
    relearning: { label: 'Needs relearning', dot: 'bg-coral', text: 'text-coral' },
};
const ratings: Record<CardType, { score: number; label: string }[]> = {
    remember: [
        { score: 1, label: 'Missed' },
        { score: 2, label: 'Struggled' },
        { score: 3, label: 'Got it' },
        { score: 4, label: 'Instantly' },
    ],
    explain: [
        { score: 1, label: "Couldn't explain" },
        { score: 2, label: 'Partially' },
        { score: 3, label: 'Clearly' },
        { score: 4, label: 'Confidently' },
    ],
    apply: [
        { score: 1, label: 'Missed it' },
        { score: 2, label: 'Needed guidance' },
        { score: 3, label: 'Applied it' },
        { score: 4, label: 'Solved confidently' },
    ],
    note: [
        { score: 1, label: 'Revisit' },
        { score: 4, label: 'Internalized' },
    ],
};

function formatInterval(days: number): string {
    if (days <= 0) return '10 min';
    if (days === 1) return '1 day';
    return `${days} days`;
}

function previewInterval(score: number, learning?: Learning): string {
    const current = learning?.interval_days ?? 0;
    if (score === 1) return formatInterval(0);
    if (score === 2) return formatInterval(1);
    if (score === 3) return formatInterval(current > 0 ? Math.max(2, current * 2) : 3);
    return formatInterval(current > 0 ? Math.max(4, current * 3) : 7);
}

const ratingStyles: Record<number, { box: string; label: string }> = {
    1: {
        box: 'border-coral/30 bg-coral/5 hover:border-coral hover:bg-coral/15',
        label: 'text-coral',
    },
    2: {
        box: 'border-amber/30 bg-amber/5 hover:border-amber hover:bg-amber/15',
        label: 'text-amber',
    },
    3: { box: 'border-moss/25 bg-moss/5 hover:border-moss hover:bg-moss/10', label: 'text-moss' },
    4: { box: 'border-moss/40 bg-moss/10 hover:border-moss hover:bg-moss/20', label: 'text-moss' },
};

export function cardHeading(card: Card): string {
    return (
        card.content.question ??
        card.content.prompt ??
        card.content.title ??
        'A note worth revisiting'
    );
}

export function LearningStateBadge({ state }: { state?: string }) {
    const info = learningStateInfo[state ?? 'new'] ?? learningStateInfo.new;
    return (
        <span className="flex items-center gap-1.5 text-xs font-medium">
            <span className={`size-1.5 shrink-0 rounded-full ${info.dot}`} />
            <span className={info.text}>{info.label}</span>
        </span>
    );
}

export function CardListItem({
    card,
    onEdit,
    onArchive,
    onRestore,
}: {
    card: Card;
    onEdit?: () => void;
    onArchive?: () => void;
    onRestore?: () => void;
}) {
    return (
        <div
            className={`flex items-center justify-between gap-4 rounded-2xl border border-ink/10 p-5 shadow-sm ${onRestore ? 'bg-paper/60' : 'bg-white/85'}`}
        >
            <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-sage px-3 py-1 text-xs font-bold text-moss">
                        {cardTypeLabels[card.type]}
                    </span>
                    <LearningStateBadge state={card.learning?.learning_state} />
                </div>
                <p className={`truncate font-semibold ${onRestore ? 'text-ink/50' : ''}`}>
                    {cardHeading(card)}
                </p>
            </div>
            {onRestore ? (
                <button
                    type="button"
                    onClick={onRestore}
                    aria-label={`Restore card: ${cardHeading(card)}`}
                    title="Restore card"
                    className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-moss hover:bg-sage"
                >
                    <ArchiveRestore size={15} /> Restore
                </button>
            ) : (
                <div className="flex shrink-0 items-center gap-1">
                    <button
                        type="button"
                        onClick={onEdit}
                        aria-label={`Edit card: ${cardHeading(card)}`}
                        title="Edit card"
                        className="shrink-0 rounded-full p-2.5 text-ink/45 hover:bg-sage hover:text-ink"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={onArchive}
                        aria-label={`Archive card: ${cardHeading(card)}`}
                        title="Archive card"
                        className="shrink-0 rounded-full p-2.5 text-ink/45 hover:bg-sage hover:text-coral"
                    >
                        <Archive size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}

export function LearningCard({ card, reviewed }: { card: Card; reviewed: () => Promise<void> }) {
    const [revealed, setRevealed] = useState(card.type === 'note');
    const [result, setResult] = useState<CardReview | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [startedAt] = useState(Date.now());
    const heading = cardHeading(card);
    return (
        <article className="rounded-3xl border border-ink/10 bg-white/85 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-sage px-3 py-1 text-xs font-bold text-moss">
                    {cardTypeLabels[card.type]}
                </span>
                <LearningStateBadge state={card.learning?.learning_state} />
            </div>
            <CardPrompt card={card} heading={heading} />
            {!revealed && (
                <button
                    type="button"
                    onClick={() => setRevealed(true)}
                    className="mt-6 w-full rounded-xl border border-moss/25 bg-sage/45 px-4 py-3 text-sm font-semibold text-moss hover:bg-sage"
                >
                    {card.type === 'remember'
                        ? 'Reveal answer'
                        : card.type === 'explain'
                          ? 'Show guidance'
                          : 'Show solution'}
                </button>
            )}
            {revealed && !result && (
                <>
                    <CardGuidance card={card} />
                    <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 rounded-b-3xl border-t border-ink/10 bg-white/95 px-6 pt-4 pb-6 backdrop-blur">
                        <p className="text-xs font-bold uppercase tracking-wider text-ink/40">
                            How did that go?
                        </p>
                        <div
                            className={`mt-3 grid gap-2 ${ratings[card.type].length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}
                        >
                            {ratings[card.type].map(({ score, label }) => (
                                <button
                                    type="button"
                                    key={score}
                                    disabled={busy}
                                    onClick={async () => {
                                        setBusy(true);
                                        setError('');
                                        try {
                                            setResult(
                                                (
                                                    await api.review(
                                                        card.id,
                                                        score,
                                                        Date.now() - startedAt,
                                                    )
                                                ).data,
                                            );
                                        } catch (reason) {
                                            setError(
                                                reason instanceof Error
                                                    ? reason.message
                                                    : 'Unable to record review.',
                                            );
                                        } finally {
                                            setBusy(false);
                                        }
                                    }}
                                    className={`flex min-h-19 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-center transition disabled:opacity-50 ${ratingStyles[score].box}`}
                                >
                                    <span
                                        className={`text-xs leading-tight font-semibold ${ratingStyles[score].label}`}
                                    >
                                        {label}
                                    </span>
                                    <span className="text-[11px] leading-tight font-medium text-ink/45">
                                        in {previewInterval(score, card.learning)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
            {result && <ReviewResult review={result} done={reviewed} />}
            {error && (
                <p role="alert" className="mt-3 text-sm text-coral">
                    {error}
                </p>
            )}
        </article>
    );
}

function CardPrompt({ card, heading }: { card: Card; heading: string }) {
    return (
        <div className="mt-5">
            {card.type === 'apply' && (
                <p className="mb-3 text-sm leading-6 text-ink/60">{card.content.scenario}</p>
            )}
            <h2 className="text-xl font-semibold leading-snug">{heading}</h2>
            {card.type === 'remember' && card.content.hint && (
                <details className="mt-4 text-sm text-ink/55">
                    <summary className="cursor-pointer font-semibold text-moss">
                        Need a hint?
                    </summary>
                    <p className="mt-2">{card.content.hint}</p>
                </details>
            )}
            {card.type === 'note' && (
                <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-ink/70">
                    {card.content.content}
                </p>
            )}
        </div>
    );
}

function CardGuidance({ card }: { card: Card }) {
    const sections =
        card.type === 'remember'
            ? [
                  ['Answer', card.content.answer],
                  ['Notes', card.content.notes],
              ]
            : card.type === 'explain'
              ? [
                    ['Expected explanation', card.content.explanation],
                    ['Key points', card.content.key_points],
                    ['Example', card.content.example],
                ]
              : card.type === 'apply'
                ? [
                      ['Suggested solution', card.content.solution],
                      ['Key takeaway', card.content.key_takeaway],
                  ]
                : [
                      [
                          'Attribution',
                          [card.content.author, card.content.source].filter(Boolean).join(' · '),
                      ],
                  ];
    const visibleSections = sections.filter(([, value]) => value);
    if (visibleSections.length === 0) return null;
    return (
        <div className="mt-5 grid gap-4 rounded-2xl bg-paper/80 p-4">
            {visibleSections.map(([label, value]) => (
                <div key={label}>
                    <p className="text-xs font-bold uppercase tracking-wider text-moss">{label}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink/70">
                        {value}
                    </p>
                </div>
            ))}
        </div>
    );
}

function ReviewResult({ review, done }: { review: CardReview; done: () => Promise<void> }) {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const raf = requestAnimationFrame(() => setProgress(100));
        const timeout = setTimeout(() => {
            void done();
        }, 1000);
        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(timeout);
        };
    }, [done]);

    return (
        <div
            role="status"
            className="mt-5 overflow-hidden rounded-2xl border border-moss/15 bg-sage/50 p-5 text-center"
        >
            <span className="mx-auto grid size-10 place-items-center rounded-full bg-moss text-white">
                <Check size={18} />
            </span>
            <p className="mt-3 font-semibold text-ink">
                You'll see this again in {formatInterval(review.interval_after_days)}
            </p>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/70">
                <div
                    className="h-full rounded-full bg-moss transition-all duration-1000 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

export function EmptyCards({ due, celebrate }: { due: boolean; celebrate?: boolean }) {
    return (
        <div className="mt-7 rounded-3xl border border-dashed border-ink/20 p-12 text-center">
            {due ? (
                <span
                    className={`mx-auto grid size-14 place-items-center rounded-full bg-moss/10 text-moss ${celebrate ? 'animate-confetti-pop' : ''}`}
                >
                    <Check size={26} />
                </span>
            ) : (
                <BookOpen className="mx-auto text-moss" />
            )}
            <p className="mt-3 text-lg font-semibold">
                {due
                    ? celebrate
                        ? 'Nice work — all done for now!'
                        : "You're caught up"
                    : 'No cards match this view'}
            </p>
            <p className="mt-1 text-sm text-ink/50">
                {due
                    ? 'There are no cards due right now.'
                    : 'Create one or adjust the type filter.'}
            </p>
        </div>
    );
}
