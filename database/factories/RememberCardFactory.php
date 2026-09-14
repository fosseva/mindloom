<?php

namespace Database\Factories;

use App\Enums\CardType;
use App\Models\Card;
use App\Models\RememberCard;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<RememberCard> */
class RememberCardFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['card_id' => Card::factory()->state(['type' => CardType::Remember]), 'question' => fake()->sentence(), 'answer' => fake()->paragraph(), 'hint' => fake()->optional()->sentence(), 'notes' => null];
    }
}
