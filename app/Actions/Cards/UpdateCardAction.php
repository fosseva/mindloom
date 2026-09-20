<?php

namespace App\Actions\Cards;

use App\Models\Card;
use App\Models\CardType;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class UpdateCardAction
{
    /** @param array<string, mixed> $attributes */
    public function __invoke(Card $card, array $attributes): Card
    {
        return DB::transaction(function () use ($card, $attributes): Card {
            $card->update(Arr::only($attributes, ['sort_order', 'archived_at']));
            $type = CardType::findOrFail($card->type_id);
            $relationship = $type->name->relationship();
            $card->{$relationship}()->update(Arr::only($attributes, $type->name->fields()));

            return $card->refresh();
        });
    }
}
