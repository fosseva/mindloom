<?php

namespace Database\Factories;

use App\Enums\CardTypeName;
use App\Enums\RecallQuality;
use App\Models\CardType;
use App\Models\Rating;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Rating>
 */
class RatingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return ['card_type_id' => fn () => CardType::query()->where('name', CardTypeName::Remember)->value('id') ?? CardType::factory()->create(['name' => CardTypeName::Remember])->id, 'name' => fake()->words(2, true), 'description' => fake()->sentence(), 'recall_quality' => RecallQuality::Remembered];
    }
}
