<?php

namespace Database\Factories;

use App\Enums\CardType;
use App\Models\Card;
use App\Models\Deck;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Card> */
class CardFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['deck_id' => Deck::factory(), 'type' => CardType::Remember, 'sort_order' => 0];
    }
}
