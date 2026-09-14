<?php

namespace Database\Factories;

use App\Enums\CardTypeName;
use App\Models\Card;
use App\Models\CardType;
use App\Models\Deck;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Card> */
class CardFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['deck_id' => Deck::factory(), 'type_id' => fn () => CardType::query()->where('name', CardTypeName::Remember)->value('id') ?? CardType::factory()->create(['name' => CardTypeName::Remember])->id, 'sort_order' => 0];
    }

    public function forType(CardTypeName $type): static
    {
        return $this->state(fn (): array => ['type_id' => CardType::query()->where('name', $type)->value('id') ?? CardType::factory()->create(['name' => $type])->id]);
    }
}
