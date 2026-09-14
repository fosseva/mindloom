<?php

namespace App\Actions\Reviews;

use App\Enums\RecallQuality;
use App\Models\LearningRecord;
use Carbon\CarbonImmutable;
use DateTimeInterface;

class ScheduleNextReviewAction
{
    private const DESIRED_RETENTION = 0.9;

    private const FORGOT_REVIEW_AFTER_MINUTES = 20;

    /** @var list<float> */
    private const WEIGHTS = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];

    /** @return array{due_at: CarbonImmutable, current_interval_minutes: int, stability_days: float, difficulty_score: float, review_count: int, last_reviewed_at: CarbonImmutable} */
    public function __invoke(LearningRecord $learningRecord, RecallQuality $recallQuality, DateTimeInterface $reviewedAt): array
    {
        $reviewedAt = CarbonImmutable::instance($reviewedAt);
        $grade = $recallQuality->value;

        if ($learningRecord->stability_days === null || $learningRecord->difficulty_score === null) {
            $stabilityDays = self::WEIGHTS[$grade - 1];
            $difficultyScore = $this->initialDifficulty($grade);
        } else {
            $lastReviewedAt = $learningRecord->last_reviewed_at;
            $elapsedDays = $lastReviewedAt === null ? 0.0 : max(0.0, $lastReviewedAt->diffInSeconds($reviewedAt, false) / 86400);
            $retrievability = $this->retrievability($elapsedDays, $learningRecord->stability_days);
            $difficultyScore = $this->nextDifficulty($learningRecord->difficulty_score, $grade);
            $stabilityDays = $this->nextStability($learningRecord->stability_days, $difficultyScore, $retrievability, $grade, $elapsedDays);
        }

        $intervalMinutes = $recallQuality === RecallQuality::Forgot
            ? self::FORGOT_REVIEW_AFTER_MINUTES
            : max(1, (int) round($this->intervalDays($stabilityDays) * 1440));

        return [
            'due_at' => $reviewedAt->addMinutes($intervalMinutes),
            'current_interval_minutes' => $intervalMinutes,
            'stability_days' => round($stabilityDays, 6),
            'difficulty_score' => round($difficultyScore, 6),
            'review_count' => $learningRecord->review_count + 1,
            'last_reviewed_at' => $reviewedAt,
        ];
    }

    private function initialDifficulty(int $grade): float
    {
        return $this->clampDifficulty(self::WEIGHTS[4] - exp(self::WEIGHTS[5] * ($grade - 1)) + 1);
    }

    private function nextDifficulty(float $difficulty, int $grade): float
    {
        $initialEasyDifficulty = $this->initialDifficulty(4);
        $delta = -self::WEIGHTS[6] * ($grade - 3);
        $dampedDifficulty = $difficulty + ($delta * (10 - $difficulty) / 9);

        return $this->clampDifficulty((self::WEIGHTS[7] * $initialEasyDifficulty) + ((1 - self::WEIGHTS[7]) * $dampedDifficulty));
    }

    private function nextStability(float $stability, float $difficulty, float $retrievability, int $grade, float $elapsedDays): float
    {
        if ($grade === 1) {
            return max(0.01, self::WEIGHTS[11] * pow($difficulty, -self::WEIGHTS[12]) * (pow($stability + 1, self::WEIGHTS[13]) - 1) * exp(self::WEIGHTS[14] * (1 - $retrievability)));
        }

        if ($elapsedDays < 1) {
            $increase = exp(self::WEIGHTS[17] * ($grade - 3 + self::WEIGHTS[18])) * pow($stability, -self::WEIGHTS[19]);

            return $stability * max(1, $increase);
        }

        $hardPenalty = $grade === 2 ? self::WEIGHTS[15] : 1;
        $easyBonus = $grade === 4 ? self::WEIGHTS[16] : 1;
        $increase = exp(self::WEIGHTS[8]) * (11 - $difficulty) * pow($stability, -self::WEIGHTS[9]) * (exp(self::WEIGHTS[10] * (1 - $retrievability)) - 1) * $hardPenalty * $easyBonus;

        return $stability * ($increase + 1);
    }

    private function retrievability(float $elapsedDays, float $stabilityDays): float
    {
        $decay = self::WEIGHTS[20];
        $factor = pow(0.9, -1 / $decay) - 1;

        return pow(1 + ($factor * $elapsedDays / $stabilityDays), -$decay);
    }

    private function intervalDays(float $stabilityDays): float
    {
        $decay = self::WEIGHTS[20];
        $factor = pow(0.9, -1 / $decay) - 1;

        return $stabilityDays / $factor * (pow(self::DESIRED_RETENTION, -1 / $decay) - 1);
    }

    private function clampDifficulty(float $difficulty): float
    {
        return min(10, max(1, $difficulty));
    }
}
