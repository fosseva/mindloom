<?php

namespace Database\Factories;

use App\Enums\CardTypeName;
use App\Models\Card;
use App\Models\NoteCard;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<NoteCard> */
class NoteCardFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['card_id' => Card::factory()->forType(CardTypeName::Note), 'title' => fake()->optional()->sentence(4), 'content' => fake()->paragraph(), 'author' => fake()->optional()->name(), 'source' => null];
    }
}
