<?php

namespace Database\Factories;

use App\Enums\ReviewRating;
use App\Models\CardReview;
use App\Models\LearningRecord;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<CardReview> */
class CardReviewFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['learning_record_id' => LearningRecord::factory(), 'rating' => ReviewRating::Three, 'reviewed_at' => now(), 'interval_before_minutes' => 0, 'interval_after_minutes' => 4320, 'due_at_before' => now(), 'due_at_after' => now()->addDays(3), 'duration_ms' => null];
    }
}
