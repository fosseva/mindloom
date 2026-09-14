<?php

use App\Actions\Reviews\ScheduleNextReviewAction;
use App\Enums\LearningState;
use App\Enums\ReviewRating;
use App\Models\LearningRecord;
use Carbon\CarbonImmutable;

test('successful recall schedules a future review', function () {
    $learningRecord = new LearningRecord(['review_count' => 0, 'lapse_count' => 0, 'interval_days' => 0, 'learning_state' => LearningState::New]);
    $reviewedAt = CarbonImmutable::parse('2026-09-13 10:00:00');

    $schedule = (new ScheduleNextReviewAction)($learningRecord, ReviewRating::Four, $reviewedAt);

    expect($schedule['learning_state'])->toBe(LearningState::Reviewing)
        ->and($schedule['interval_days'])->toBe(7)
        ->and($schedule['due_at']->equalTo($reviewedAt->addDays(7)))->toBeTrue()
        ->and($schedule['review_count'])->toBe(1);
});

test('a missed learned card enters relearning and counts a lapse', function () {
    $learningRecord = new LearningRecord(['review_count' => 4, 'lapse_count' => 1, 'interval_days' => 12, 'learning_state' => LearningState::Reviewing]);
    $reviewedAt = CarbonImmutable::parse('2026-09-13 10:00:00');

    $schedule = (new ScheduleNextReviewAction)($learningRecord, ReviewRating::One, $reviewedAt);

    expect($schedule['learning_state'])->toBe(LearningState::Relearning)
        ->and($schedule['interval_days'])->toBe(0)
        ->and($schedule['due_at']->equalTo($reviewedAt->addMinutes(10)))->toBeTrue()
        ->and($schedule['lapse_count'])->toBe(2);
});
