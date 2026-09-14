<?php

namespace App\Actions\Decks;

use App\Models\Deck;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class CreateDeckAction
{
    /** @param array{name:string, description?:?string, sort_order?:int} $attributes */
    public function __invoke(User $user, array $attributes): Deck
    {
        return DB::transaction(function () use ($user, $attributes): Deck {
            $deck = $user->ownedDecks()->create(Arr::except($attributes, 'sort_order'));
            $deck->userPreferences()->create(['user_id' => $user->id, 'sort_order' => $attributes['sort_order'] ?? 0]);

            return $deck->setAttribute('user_sort_order', $attributes['sort_order'] ?? 0);
        });
    }
}
