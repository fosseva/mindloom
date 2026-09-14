<?php

namespace App\SpacedRepetition;

use App\Enums\SchedulerVersion;
use Carbon\CarbonImmutable;

final readonly class SchedulingResult
{
    public function __construct(
        public SchedulerVersion $schedulerVersion,
        public CarbonImmutable $dueAt,
        public int $intervalMinutes,
        public float $stabilityDays,
        public float $difficultyScore,
    ) {}
}
