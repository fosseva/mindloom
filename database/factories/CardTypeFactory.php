<?php

namespace Database\Factories;

use App\Enums\CardTypeName;
use App\Models\CardType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CardType>
 */
class CardTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return ['name' => CardTypeName::Remember, 'description' => fake()->sentence()];
    }
}
