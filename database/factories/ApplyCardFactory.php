<?php

namespace Database\Factories;

use App\Enums\CardType;
use App\Models\ApplyCard;
use App\Models\Card;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ApplyCard> */
class ApplyCardFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['card_id' => Card::factory()->state(['type' => CardType::Apply]), 'scenario' => fake()->paragraph(), 'question' => fake()->sentence(), 'solution' => fake()->paragraph(), 'key_takeaway' => null];
    }
}
