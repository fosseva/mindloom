<?php

namespace Database\Factories;

use App\Enums\CardTypeName;
use App\Models\Card;
use App\Models\ExplainCard;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ExplainCard> */
class ExplainCardFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['card_id' => Card::factory()->forType(CardTypeName::Explain), 'prompt' => fake()->sentence(), 'explanation' => fake()->paragraph(), 'key_points' => fake()->optional()->sentence(), 'example' => null];
    }
}
