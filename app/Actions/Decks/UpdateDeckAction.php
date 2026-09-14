<?php

namespace App\Actions\Decks;

use App\Models\Deck;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class UpdateDeckAction
{
    /** @param array<string, mixed> $attributes */
    public function __invoke(User $user, Deck $deck, array $attributes): Deck
    {
        return DB::transaction(function () use ($user, $deck, $attributes): Deck {
            $deck->update(Arr::except($attributes, 'sort_order'));
            if (array_key_exists('sort_order', $attributes)) {
                $deck->userPreferences()->updateOrCreate(['user_id' => $user->id], ['sort_order' => $attributes['sort_order']]);
            }

            return $deck->refresh()->setAttribute('user_sort_order', $deck->userPreferences()->whereBelongsTo($user)->value('sort_order') ?? 0);
        });
    }
}
