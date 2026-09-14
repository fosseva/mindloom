<?php

namespace App\Actions\Cards;

use App\Enums\CardType;
use App\Enums\LearningState;
use App\Models\Card;
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
            $type = CardType::from($attributes['type']);
            $card = $deck->cards()->create(['type' => $type, 'sort_order' => $attributes['sort_order'] ?? 0]);
            $card->{$type->relationship()}()->create(Arr::only($attributes, $type->fields()));
            $card->learningRecords()->create(['user_id' => $user->id, 'due_at' => now(), 'learning_state' => LearningState::New]);

            return $card->load([$type->relationship(), 'learningRecords']);
        });
    }
}
