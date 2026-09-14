<?php

namespace App\Actions\Reviews;

use App\Models\Card;
use App\Models\CardReview;
use App\Models\Rating;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class RecordCardReviewAction
{
    public function __construct(public ScheduleNextReviewAction $scheduler) {}

    public function __invoke(User $user, Card $card, Rating $rating, CarbonImmutable $reviewedAt, ?int $durationMs = null): CardReview
    {
        return DB::transaction(function () use ($user, $card, $rating, $reviewedAt, $durationMs): CardReview {
            $learningRecord = $card->learningRecords()->whereBelongsTo($user)->lockForUpdate()->firstOrFail();
            $beforeInterval = $learningRecord->current_interval_minutes;
            $beforeDueAt = $learningRecord->due_at;
            $schedule = ($this->scheduler)($learningRecord, $rating->recall_quality, $reviewedAt);
            $learningRecord->update([
                'due_at' => $schedule->dueAt,
                'current_interval_minutes' => $schedule->intervalMinutes,
                'stability_days' => $schedule->stabilityDays,
                'difficulty_score' => $schedule->difficultyScore,
                'scheduler_version' => $schedule->schedulerVersion,
                'review_count' => $learningRecord->review_count + 1,
                'last_reviewed_at' => $reviewedAt,
            ]);

            return $learningRecord->reviews()->create([
                'rating_id' => $rating->id,
                'scheduler_version' => $schedule->schedulerVersion,
                'reviewed_at' => $reviewedAt,
                'interval_before_minutes' => $beforeInterval,
                'interval_after_minutes' => $schedule->intervalMinutes,
                'due_at_before' => $beforeDueAt,
                'due_at_after' => $schedule->dueAt,
                'duration_ms' => $durationMs,
            ]);
        });
    }
}
