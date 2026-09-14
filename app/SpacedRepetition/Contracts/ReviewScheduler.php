<?php

namespace App\SpacedRepetition\Contracts;

use App\Enums\RecallQuality;
use App\Models\LearningRecord;
use App\SpacedRepetition\SchedulingResult;
use DateTimeInterface;

interface ReviewScheduler
{
    public function schedule(
        LearningRecord $learningRecord,
        RecallQuality $recallQuality,
        DateTimeInterface $reviewedAt,
    ): SchedulingResult;
}
