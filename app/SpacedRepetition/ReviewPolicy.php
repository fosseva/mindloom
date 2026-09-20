<?php

namespace App\SpacedRepetition;

final readonly class ReviewPolicy
{
    public function __construct(
        public float $desiredRetention,
        public int $forgotReviewAfterMinutes,
    ) {}
}
