<?php

namespace App\Actions\Reviews;

use App\Enums\LearningState;
use App\Enums\ReviewRating;
use App\Models\LearningRecord;
use Carbon\CarbonImmutable;
use DateTimeInterface;

class ScheduleNextReviewAction
{
    /** @return array{learning_state: LearningState, due_at: CarbonImmutable, interval_days: int, review_count: int, relearning_count: int, last_reviewed_at: CarbonImmutable} */
    public function __invoke(LearningRecord $learningRecord, ReviewRating $rating, DateTimeInterface $reviewedAt): array
    {
        $reviewedAt = CarbonImmutable::instance($reviewedAt);
        $wasLearned = $learningRecord->review_count > 0;

        [$intervalDays, $dueAt, $state] = match ($rating) {
            ReviewRating::One => [0, $reviewedAt->addMinutes(10), $wasLearned ? LearningState::Relearning : LearningState::Learning],
            ReviewRating::Two => [1, $reviewedAt->addDay(), $wasLearned ? LearningState::Relearning : LearningState::Learning],
            ReviewRating::Three => [$learningRecord->interval_days > 0 ? max(2, $learningRecord->interval_days * 2) : 3, null, LearningState::Reviewing],
            ReviewRating::Four => [$learningRecord->interval_days > 0 ? max(4, $learningRecord->interval_days * 3) : 7, null, LearningState::Reviewing],
        };

        $dueAt ??= $reviewedAt->addDays($intervalDays);

        return [
            'learning_state' => $state,
            'due_at' => $dueAt,
            'interval_days' => $intervalDays,
            'review_count' => $learningRecord->review_count + 1,
            'relearning_count' => $learningRecord->relearning_count + (($wasLearned && $rating->value <= 2) ? 1 : 0),
            'last_reviewed_at' => $reviewedAt,
        ];
    }
}
