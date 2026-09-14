<?php

use App\Actions\Reviews\ScheduleNextReviewAction;
use App\Enums\RecallQuality;
use App\Enums\SchedulerVersion;
use App\Models\LearningRecord;
use App\SpacedRepetition\ReviewPolicy;
use Carbon\CarbonImmutable;
use Tests\TestCase;

uses(TestCase::class);

test('an easy first recall starts with a long stability interval', function () {
    $learningRecord = new LearningRecord(['review_count' => 0, 'current_interval_minutes' => 0]);
    $reviewedAt = CarbonImmutable::parse('2026-09-13 10:00:00');

    $schedule = app(ScheduleNextReviewAction::class)($learningRecord, RecallQuality::Easy, $reviewedAt);

    expect($schedule->schedulerVersion)->toBe(SchedulerVersion::Fsrs6)
        ->and($schedule->intervalMinutes)->toBe(11946)
        ->and($schedule->stabilityDays)->toBe(8.2956)
        ->and($schedule->difficultyScore)->toBe(1.0)
        ->and($schedule->dueAt->equalTo($reviewedAt->addMinutes(11946)))->toBeTrue();
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

    $schedule = app(ScheduleNextReviewAction::class)($learningRecord, RecallQuality::Forgot, $reviewedAt);

    expect($schedule->intervalMinutes)->toBe(20)
        ->and($schedule->dueAt->equalTo($reviewedAt->addMinutes(20)))->toBeTrue();
});

test('the forgotten review delay follows the configured review policy', function () {
    config(['reviews.policy.forgot_review_after_minutes' => 35]);
    app()->forgetInstance(ReviewPolicy::class);
    $learningRecord = new LearningRecord(['review_count' => 0, 'current_interval_minutes' => 0]);
    $reviewedAt = CarbonImmutable::parse('2026-09-13 10:00:00');

    $schedule = app(ScheduleNextReviewAction::class)($learningRecord, RecallQuality::Forgot, $reviewedAt);

    expect($schedule->intervalMinutes)->toBe(35)
        ->and($schedule->dueAt->equalTo($reviewedAt->addMinutes(35)))->toBeTrue();
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

    $schedule = app(ScheduleNextReviewAction::class)($learningRecord, RecallQuality::Easy, $lastReviewedAt->addDays(8));

    expect($schedule->intervalMinutes)->toBeGreaterThan(11946)
        ->and($schedule->stabilityDays)->toBeGreaterThan(8.2956)
        ->and($schedule->difficultyScore)->toBe(1.0);
});
