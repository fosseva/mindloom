<?php

namespace Database\Factories;

use App\Models\Card;
use App\Models\LearningRecord;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<LearningRecord> */
class LearningRecordFactory extends Factory
{
    /** @return array<string,mixed> */
    public function definition(): array
    {
        return ['user_id' => User::factory(), 'card_id' => Card::factory(), 'due_at' => now(), 'review_count' => 0, 'current_interval_minutes' => 0, 'stability_days' => null, 'difficulty_score' => null];
    }
}
