<?php

namespace App\Actions\Cards;

use App\Models\Card;
use App\Models\CardType;
use App\Models\Deck;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class CreateCardAction
{
    /** @param array<string, mixed> $attributes */
    public function __invoke(User $user, Deck $deck, array $attributes): Card
    {
        return DB::transaction(function () use ($user, $deck, $attributes): Card {
            $type = CardType::findOrFail($attributes['type_id']);
            $card = $deck->cards()->create(['type_id' => $type->id, 'sort_order' => $attributes['sort_order'] ?? 0]);
            $card->{$type->name->relationship()}()->create(Arr::only($attributes, $type->name->fields()));
            $card->learningRecords()->create(['user_id' => $user->id, 'due_at' => now()]);

            return $card->load(['type.ratings', $type->name->relationship(), 'learningRecords']);
        });
    }
}
