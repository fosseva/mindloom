<?php

namespace App\Actions\Reviews;

use App\Enums\RecallQuality;
use App\Models\LearningRecord;
use App\SpacedRepetition\Contracts\ReviewScheduler;
use App\SpacedRepetition\SchedulingResult;
use DateTimeInterface;

class ScheduleNextReviewAction
{
    public function __construct(private readonly ReviewScheduler $scheduler) {}

    public function __invoke(
        LearningRecord $learningRecord,
        RecallQuality $recallQuality,
        DateTimeInterface $reviewedAt,
    ): SchedulingResult {
        return $this->scheduler->schedule($learningRecord, $recallQuality, $reviewedAt);
    }
}
