<?php

namespace App\SpacedRepetition\Fsrs6;

use App\Enums\RecallQuality;
use App\Enums\SchedulerVersion;
use App\Models\LearningRecord;
use App\SpacedRepetition\Contracts\ReviewScheduler;
use App\SpacedRepetition\ReviewPolicy;
use App\SpacedRepetition\SchedulingResult;
use Carbon\CarbonImmutable;
use DateTimeInterface;

final class Fsrs6Scheduler implements ReviewScheduler
{
    public const SchedulerVersion VERSION = SchedulerVersion::Fsrs6;

    private const MINUTES_PER_DAY = 1440;

    private const SECONDS_PER_DAY = 86400;

    private const MINIMUM_STABILITY_DAYS = 0.01;

    private const MINIMUM_DIFFICULTY = 1.0;

    private const MAXIMUM_DIFFICULTY = 10.0;

    /** FSRS defines stability as the point where retrievability falls to 90%. */
    private const RETRIEVABILITY_AT_ONE_STABILITY = 0.9;

    public function __construct(
        private readonly Fsrs6Parameters $parameters,
        private readonly ReviewPolicy $policy,
    ) {}

    public function schedule(
        LearningRecord $learningRecord,
        RecallQuality $recallQuality,
        DateTimeInterface $reviewedAt,
    ): SchedulingResult {
        $reviewedAt = CarbonImmutable::instance($reviewedAt);
        $grade = $recallQuality->value;

        if ($learningRecord->stability_days === null || $learningRecord->difficulty_score === null) {
            $stabilityDays = $this->parameters->initialStability($recallQuality);
            $difficultyScore = $this->initialDifficulty($grade);
        } else {
            $lastReviewedAt = $learningRecord->last_reviewed_at;
            $elapsedDays = $lastReviewedAt === null
                ? 0.0
                : max(0.0, $lastReviewedAt->diffInSeconds($reviewedAt, false) / self::SECONDS_PER_DAY);
            $retrievability = $this->retrievability($elapsedDays, $learningRecord->stability_days);
            $difficultyScore = $this->nextDifficulty($learningRecord->difficulty_score, $grade);
            $stabilityDays = $this->nextStability($learningRecord->stability_days, $difficultyScore, $retrievability, $grade, $elapsedDays);
        }

        $intervalMinutes = $recallQuality === RecallQuality::Forgot
            ? $this->policy->forgotReviewAfterMinutes
            : max(1, (int) round($this->intervalDays($stabilityDays) * self::MINUTES_PER_DAY));

        return new SchedulingResult(
            schedulerVersion: self::VERSION,
            dueAt: $reviewedAt->addMinutes($intervalMinutes),
            intervalMinutes: $intervalMinutes,
            stabilityDays: round($stabilityDays, 6),
            difficultyScore: round($difficultyScore, 6),
        );
    }

    private function initialDifficulty(int $grade): float
    {
        // A better first recall starts a card at a lower estimated difficulty.
        $difficulty = $this->parameters->initialDifficultyBase
            - exp($this->parameters->initialDifficultyRatingScale * ($grade - 1))
            + 1;

        return $this->clampDifficulty($difficulty);
    }

    private function nextDifficulty(float $difficulty, int $grade): float
    {
        $initialEasyDifficulty = $this->initialDifficulty(4);
        // Rating 3 is neutral; lower ratings increase difficulty and higher ones reduce it.
        $difficultyChange = -$this->parameters->difficultyChangeScale * ($grade - 3);
        $difficultyRange = self::MAXIMUM_DIFFICULTY - self::MINIMUM_DIFFICULTY;
        $distanceFromMaximum = self::MAXIMUM_DIFFICULTY - $difficulty;
        $dampedDifficulty = $difficulty + ($difficultyChange * $distanceFromMaximum / $difficultyRange);

        // Mean reversion prevents repeated reviews from pinning difficulty at an extreme.
        $meanReversion = $this->parameters->difficultyMeanReversion;
        $nextDifficulty = ($meanReversion * $initialEasyDifficulty)
            + ((1 - $meanReversion) * $dampedDifficulty);

        return $this->clampDifficulty($nextDifficulty);
    }

    private function nextStability(float $stability, float $difficulty, float $retrievability, int $grade, float $elapsedDays): float
    {
        if ($grade === 1) {
            // Forgetting rebuilds stability from the card's prior stability and difficulty.
            $difficultyEffect = pow($difficulty, -$this->parameters->forgottenDifficultyExponent);
            $previousStabilityEffect = pow($stability + 1, $this->parameters->forgottenStabilityExponent) - 1;
            $retrievabilityEffect = exp($this->parameters->forgottenRetrievabilitySensitivity * (1 - $retrievability));
            $nextStability = $this->parameters->forgottenStabilityScale
                * $difficultyEffect
                * $previousStabilityEffect
                * $retrievabilityEffect;

            return max(self::MINIMUM_STABILITY_DAYS, $nextStability);
        }

        if ($elapsedDays < 1) {
            // Same-day reviews use a short-term adjustment because little forgetting has occurred.
            $ratingEffect = exp(
                $this->parameters->sameDayStabilityScale
                * ($grade - 3 + $this->parameters->sameDayRatingOffset)
            );
            $stabilityEffect = pow($stability, -$this->parameters->sameDayStabilitySaturation);
            $increase = $ratingEffect * $stabilityEffect;

            return $stability * max(1, $increase);
        }

        // Later successful reviews reward desirable difficulty: more elapsed forgetting
        // creates a larger stability gain, while already-stable cards gain more slowly.
        $difficultyEffect = (self::MAXIMUM_DIFFICULTY + 1) - $difficulty;
        $stabilityEffect = pow($stability, -$this->parameters->stabilitySaturation);
        $retrievabilityEffect = exp(
            $this->parameters->retrievabilitySensitivity * (1 - $retrievability)
        ) - 1;
        $difficultRatingAdjustment = $grade === 2 ? $this->parameters->difficultRatingPenalty : 1;
        $easyRatingAdjustment = $grade === 4 ? $this->parameters->easyRatingBonus : 1;
        $increase = exp($this->parameters->recallStabilityGrowth)
            * $difficultyEffect
            * $stabilityEffect
            * $retrievabilityEffect
            * $difficultRatingAdjustment
            * $easyRatingAdjustment;

        return $stability * ($increase + 1);
    }

    private function retrievability(float $elapsedDays, float $stabilityDays): float
    {
        // Retrievability is the estimated probability of remembering the card now.
        $decay = $this->parameters->forgettingCurveDecay;
        $factor = pow(self::RETRIEVABILITY_AT_ONE_STABILITY, -1 / $decay) - 1;

        return pow(1 + ($factor * $elapsedDays / $stabilityDays), -$decay);
    }

    private function intervalDays(float $stabilityDays): float
    {
        // This is the inverse forgetting curve: find when recall probability will
        // reach the product's desired retention target.
        $decay = $this->parameters->forgettingCurveDecay;
        $factor = pow(self::RETRIEVABILITY_AT_ONE_STABILITY, -1 / $decay) - 1;

        return $stabilityDays / $factor
            * (pow($this->policy->desiredRetention, -1 / $decay) - 1);
    }

    private function clampDifficulty(float $difficulty): float
    {
        return min(self::MAXIMUM_DIFFICULTY, max(self::MINIMUM_DIFFICULTY, $difficulty));
    }
}
