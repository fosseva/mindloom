<?php

namespace App\Actions\Reviews;

use App\Enums\LearningState;
use App\Enums\ReviewRating;
use App\Models\LearningRecord;
use Carbon\CarbonImmutable;
use DateTimeInterface;

class ScheduleNextReviewAction
{
    /** @return array{learning_state: LearningState, due_at: CarbonImmutable, interval_minutes: int, review_count: int, relearning_count: int, last_reviewed_at: CarbonImmutable} */
    public function __invoke(LearningRecord $learningRecord, ReviewRating $rating, DateTimeInterface $reviewedAt): array
    {
        $reviewedAt = CarbonImmutable::instance($reviewedAt);
        $wasLearned = $learningRecord->review_count > 0;

        [$intervalMinutes, $dueAt, $state] = match ($rating) {
            ReviewRating::One => [10, $reviewedAt->addMinutes(10), $wasLearned ? LearningState::Relearning : LearningState::Learning],
            ReviewRating::Two => [1440, $reviewedAt->addDay(), $wasLearned ? LearningState::Relearning : LearningState::Learning],
            ReviewRating::Three => [$learningRecord->interval_minutes > 0 ? max(2880, $learningRecord->interval_minutes * 2) : 4320, null, LearningState::Reviewing],
            ReviewRating::Four => [$learningRecord->interval_minutes > 0 ? max(5760, $learningRecord->interval_minutes * 3) : 10080, null, LearningState::Reviewing],
        };

        $dueAt ??= $reviewedAt->addMinutes($intervalMinutes);

        return [
            'learning_state' => $state,
            'due_at' => $dueAt,
            'interval_minutes' => $intervalMinutes,
            'review_count' => $learningRecord->review_count + 1,
            'relearning_count' => $learningRecord->relearning_count + (($wasLearned && $rating->value <= 2) ? 1 : 0),
            'last_reviewed_at' => $reviewedAt,
        ];
    }
}
