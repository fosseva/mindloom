import { useEffect, useState } from 'react';
import { Archive, ArchiveRestore, BookOpen, Check, Pencil } from 'lucide-react';
import { api } from '../../services/apiClient';
import type { Card, CardReview, LearningRecord } from '../../types';
import { cardTypeLabels } from './cardConfig';
const learningStateInfo = {
    new: { label: 'Not started', dot: 'bg-ink/30', text: 'text-ink/45' },
    due: { label: 'Due for review', dot: 'bg-coral', text: 'text-coral' },
    scheduled: { label: 'Scheduled', dot: 'bg-moss', text: 'text-moss' },
};

export function formatReviewInterval(minutes: number): string {
    const totalMinutes = Math.max(1, Math.round(minutes));
    if (totalMinutes < 1440) return `${totalMinutes} min`;

    const approximateDays = Math.max(1, Math.round(totalMinutes / 1440));
    return `about ${approximateDays} ${approximateDays === 1 ? 'day' : 'days'}`;
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

export function ReviewStatusBadge({ learningRecord }: { learningRecord?: LearningRecord }) {
    const state =
        !learningRecord || learningRecord.review_count === 0
            ? 'new'
            : learningRecord.due_at && new Date(learningRecord.due_at) <= new Date()
              ? 'due'
              : 'scheduled';
    const info = learningStateInfo[state];
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
            className={`flex items-center justify-between gap-2.5 rounded-2xl border border-ink/10 p-3.5 shadow-sm sm:gap-4 sm:p-5 ${onRestore ? 'bg-paper/60' : 'bg-white/85'}`}
        >
            <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-1.5 sm:mb-2 sm:gap-2">
                    <span className="rounded-full bg-sage px-2.5 py-0.5 text-[11px] font-bold text-moss sm:px-3 sm:py-1 sm:text-xs">
                        {cardTypeLabels[card.type.name]}
                    </span>
                    <ReviewStatusBadge learningRecord={card.learning_record} />
                </div>
                <p
                    className={`font-semibold break-words sm:truncate ${onRestore ? 'text-ink/50' : ''}`}
                >
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
                        className="shrink-0 rounded-full p-2 text-ink/45 hover:bg-sage hover:text-ink sm:p-2.5"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={onArchive}
                        aria-label={`Archive card: ${cardHeading(card)}`}
                        title="Archive card"
                        className="shrink-0 rounded-full p-2 text-ink/45 hover:bg-sage hover:text-coral sm:p-2.5"
                    >
                        <Archive size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}

export function LearningCard({ card, reviewed }: { card: Card; reviewed: () => Promise<void> }) {
    const [revealed, setRevealed] = useState(card.type.name === 'Note');
    const [result, setResult] = useState<CardReview | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [startedAt] = useState(Date.now());
    const heading = cardHeading(card);
    return (
        <article className="rounded-2xl border border-ink/10 bg-white/85 p-4 shadow-sm sm:rounded-3xl sm:p-6">
            <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-sage px-3 py-1 text-xs font-bold text-moss">
                    {cardTypeLabels[card.type.name]}
                </span>
                <ReviewStatusBadge learningRecord={card.learning_record} />
            </div>
            <CardPrompt card={card} heading={heading} />
            {!revealed && (
                <button
                    type="button"
                    onClick={() => setRevealed(true)}
                    className="mt-4 w-full rounded-xl border border-moss/25 bg-sage/45 px-4 py-2.5 text-sm font-semibold text-moss hover:bg-sage sm:mt-6 sm:py-3"
                >
                    {card.type.name === 'Remember'
                        ? 'Reveal answer'
                        : card.type.name === 'Explain'
                          ? 'Show guidance'
                          : 'Show solution'}
                </button>
            )}
            {revealed && !result && (
                <>
                    <CardGuidance card={card} />
                    <div className="sticky bottom-16 -mx-4 -mb-4 mt-4 rounded-b-2xl border-t border-ink/10 bg-white/95 px-4 pt-3 pb-4 backdrop-blur sm:bottom-0 sm:-mx-6 sm:-mb-6 sm:mt-6 sm:rounded-b-3xl sm:px-6 sm:pt-4 sm:pb-6">
                        <p className="text-xs font-bold uppercase tracking-wider text-ink/40">
                            How did that go?
                        </p>
                        <div
                            className={`mt-3 grid gap-2 ${card.type.ratings.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}
                        >
                            {card.type.ratings.map((rating) => (
                                <button
                                    type="button"
                                    key={rating.id}
                                    disabled={busy}
                                    onClick={async () => {
                                        setBusy(true);
                                        setError('');
                                        try {
                                            setResult(
                                                (
                                                    await api.review(
                                                        card.id,
                                                        rating.id,
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
                                    title={rating.description}
                                    className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-center transition disabled:opacity-50 sm:min-h-19 sm:py-2.5 ${ratingStyles[rating.recall_quality].box}`}
                                >
                                    <span
                                        className={`text-xs leading-tight font-semibold ${ratingStyles[rating.recall_quality].label}`}
                                    >
                                        {rating.name}
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
        <div className="mt-4 sm:mt-5">
            {card.type.name === 'Apply' && (
                <p className="mb-3 text-sm leading-6 text-ink/60">{card.content.scenario}</p>
            )}
            <h2 className="text-lg font-semibold leading-snug sm:text-xl">{heading}</h2>
            {card.type.name === 'Remember' && card.content.hint && (
                <details className="mt-4 text-sm text-ink/55">
                    <summary className="cursor-pointer font-semibold text-moss">
                        Need a hint?
                    </summary>
                    <p className="mt-2">{card.content.hint}</p>
                </details>
            )}
            {card.type.name === 'Note' && (
                <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-ink/70">
                    {card.content.content}
                </p>
            )}
        </div>
    );
}

function CardGuidance({ card }: { card: Card }) {
    const sections =
        card.type.name === 'Remember'
            ? [
                  ['Answer', card.content.answer],
                  ['Notes', card.content.notes],
              ]
            : card.type.name === 'Explain'
              ? [
                    ['Expected explanation', card.content.explanation],
                    ['Key points', card.content.key_points],
                    ['Example', card.content.example],
                ]
              : card.type.name === 'Apply'
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
        <div className="mt-4 grid gap-3 rounded-2xl bg-paper/80 p-3.5 sm:mt-5 sm:gap-4 sm:p-4">
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
                You'll see this again in {formatReviewInterval(review.interval_after_minutes)}
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
        <div className="mt-4 rounded-2xl border border-dashed border-ink/20 p-7 text-center sm:mt-7 sm:rounded-3xl sm:p-12">
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
