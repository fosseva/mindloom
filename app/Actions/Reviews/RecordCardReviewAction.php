<?php

namespace App\Actions\Reviews;

use App\Enums\ReviewRating;
use App\Models\Card;
use App\Models\CardReview;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class RecordCardReviewAction
{
    public function __construct(public ScheduleNextReviewAction $scheduler) {}

    public function __invoke(User $user, Card $card, ReviewRating $rating, CarbonImmutable $reviewedAt, ?int $durationMs = null): CardReview
    {
        return DB::transaction(function () use ($user, $card, $rating, $reviewedAt, $durationMs): CardReview {
            $learningRecord = $card->learningRecords()->whereBelongsTo($user)->lockForUpdate()->firstOrFail();
            $beforeInterval = $learningRecord->interval_minutes;
            $beforeDueAt = $learningRecord->due_at;
            $schedule = ($this->scheduler)($learningRecord, $rating, $reviewedAt);
            $learningRecord->update($schedule);

            return $learningRecord->reviews()->create([
                'rating' => $rating,
                'reviewed_at' => $reviewedAt,
                'interval_before_minutes' => $beforeInterval,
                'interval_after_minutes' => $schedule['interval_minutes'],
                'due_at_before' => $beforeDueAt,
                'due_at_after' => $schedule['due_at'],
                'duration_ms' => $durationMs,
            ]);
        });
    }
}
