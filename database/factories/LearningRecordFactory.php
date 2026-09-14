<?php

namespace Database\Factories;

use App\Enums\LearningState;
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
        return ['user_id' => User::factory(), 'card_id' => Card::factory(), 'due_at' => now(), 'review_count' => 0, 'relearning_count' => 0, 'interval_minutes' => 0, 'learning_state' => LearningState::New];
    }
}
