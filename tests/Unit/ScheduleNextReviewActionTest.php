<?php

use App\Actions\Reviews\ScheduleNextReviewAction;
use App\Enums\RecallQuality;
use App\Models\LearningRecord;
use Carbon\CarbonImmutable;
use Tests\TestCase;

uses(TestCase::class);

test('an easy first recall starts with a long stability interval', function () {
    $learningRecord = new LearningRecord(['review_count' => 0, 'current_interval_minutes' => 0]);
    $reviewedAt = CarbonImmutable::parse('2026-09-13 10:00:00');

    $schedule = (new ScheduleNextReviewAction)($learningRecord, RecallQuality::Easy, $reviewedAt);

    expect($schedule['current_interval_minutes'])->toBe(11946)
        ->and($schedule['stability_days'])->toBe(8.2956)
        ->and($schedule['difficulty_score'])->toBe(1.0)
        ->and($schedule['due_at']->equalTo($reviewedAt->addMinutes(11946)))->toBeTrue()
        ->and($schedule['review_count'])->toBe(1);
});

test('a forgotten card returns after twenty minutes without a learning state', function () {
    $learningRecord = new LearningRecord([
        'review_count' => 4,
        'current_interval_minutes' => 11946,
        'stability_days' => 8.2956,
        'difficulty_score' => 3.0,
        'last_reviewed_at' => CarbonImmutable::parse('2026-09-05 10:00:00'),
    ]);
    $reviewedAt = CarbonImmutable::parse('2026-09-13 10:00:00');

    $schedule = (new ScheduleNextReviewAction)($learningRecord, RecallQuality::Forgot, $reviewedAt);

    expect($schedule['current_interval_minutes'])->toBe(20)
        ->and($schedule['due_at']->equalTo($reviewedAt->addMinutes(20)))->toBeTrue()
        ->and($schedule)->not->toHaveKey('learning_state')
        ->and($schedule)->not->toHaveKey('relearning_count');
});

test('repeated easy recalls increase the interval adaptively', function () {
    $lastReviewedAt = CarbonImmutable::parse('2026-09-05 10:00:00');
    $learningRecord = new LearningRecord([
        'review_count' => 1,
        'current_interval_minutes' => 11946,
        'stability_days' => 8.2956,
        'difficulty_score' => 1.0,
        'last_reviewed_at' => $lastReviewedAt,
    ]);

    $schedule = (new ScheduleNextReviewAction)($learningRecord, RecallQuality::Easy, $lastReviewedAt->addDays(8));

    expect($schedule['current_interval_minutes'])->toBeGreaterThan(11946)
        ->and($schedule['stability_days'])->toBeGreaterThan(8.2956)
        ->and($schedule['difficulty_score'])->toBe(1.0);
});
