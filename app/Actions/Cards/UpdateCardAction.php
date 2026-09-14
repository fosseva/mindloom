<?php

namespace App\Actions\Cards;

use App\Models\Card;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class UpdateCardAction
{
    /** @param array<string, mixed> $attributes */
    public function __invoke(Card $card, array $attributes): Card
    {
        return DB::transaction(function () use ($card, $attributes): Card {
            $card->update(Arr::only($attributes, ['sort_order', 'archived_at']));
            $relationship = $card->type->relationship();
            $card->{$relationship}()->update(Arr::only($attributes, $card->type->fields()));

            return $card->refresh()->load([$relationship, 'learningRecords']);
        });
    }
}
