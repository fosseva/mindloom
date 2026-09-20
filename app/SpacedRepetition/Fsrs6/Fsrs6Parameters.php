<?php

namespace App\SpacedRepetition\Fsrs6;

use App\Enums\RecallQuality;

class Fsrs6Parameters
{
    public function __construct(
        public readonly float $initialStabilityForgot = 0.212,
        public readonly float $initialStabilityDifficult = 1.2931,
        public readonly float $initialStabilityRemembered = 2.3065,
        public readonly float $initialStabilityEasy = 8.2956,
        public readonly float $initialDifficultyBase = 6.4133,
        public readonly float $initialDifficultyRatingScale = 0.8334,
        public readonly float $difficultyChangeScale = 3.0194,
        public readonly float $difficultyMeanReversion = 0.001,
        public readonly float $recallStabilityGrowth = 1.8722,
        public readonly float $stabilitySaturation = 0.1666,
        public readonly float $retrievabilitySensitivity = 0.796,
        public readonly float $forgottenStabilityScale = 1.4835,
        public readonly float $forgottenDifficultyExponent = 0.0614,
        public readonly float $forgottenStabilityExponent = 0.2629,
        public readonly float $forgottenRetrievabilitySensitivity = 1.6483,
        public readonly float $difficultRatingPenalty = 0.6014,
        public readonly float $easyRatingBonus = 1.8729,
        public readonly float $sameDayStabilityScale = 0.5425,
        public readonly float $sameDayRatingOffset = 0.0912,
        public readonly float $sameDayStabilitySaturation = 0.0658,
        public readonly float $forgettingCurveDecay = 0.1542,
    ) {}

    public function initialStability(RecallQuality $recallQuality): float
    {
        return match ($recallQuality) {
            RecallQuality::Forgot => $this->initialStabilityForgot,
            RecallQuality::Difficult => $this->initialStabilityDifficult,
            RecallQuality::Remembered => $this->initialStabilityRemembered,
            RecallQuality::Easy => $this->initialStabilityEasy,
        };
    }
}
