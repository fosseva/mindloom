<?php

namespace Database\Factories;

use App\Enums\CardTypeName;
use App\Models\ApplyCard;
use App\Models\Card;
use App\Models\CardType;
use App\Models\Deck;
use App\Models\ExplainCard;
use App\Models\NoteCard;
use App\Models\RememberCard;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Card> */
class CardFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'deck_id' => Deck::factory(),
            'type_id' => fn () => CardType::query()
                ->where('name', CardTypeName::Remember)
                ->value('id') ?? CardType::factory()
                ->create(['name' => CardTypeName::Remember])
                ->id,
            'sort_order' => 0,
        ];
    }

    public function forType(CardTypeName $type): static
    {
        return $this->state(fn (): array => [
            'type_id' => CardType::query()->where('name', $type)->value('id')
                ?? CardType::factory()->create(['name' => $type])->id,
        ]);
    }

    public function remember(): static
    {
        return $this->forType(CardTypeName::Remember)
            ->afterCreating(fn (Card $card) => RememberCard::factory()->for($card)->create());
    }

    public function explain(): static
    {
        return $this->forType(CardTypeName::Explain)
            ->afterCreating(fn (Card $card) => ExplainCard::factory()->for($card)->create());
    }

    public function apply(): static
    {
        return $this->forType(CardTypeName::Apply)
            ->afterCreating(fn (Card $card) => ApplyCard::factory()->for($card)->create());
    }

    public function note(): static
    {
        return $this->forType(CardTypeName::Note)
            ->afterCreating(fn (Card $card) => NoteCard::factory()->for($card)->create());
    }
}
