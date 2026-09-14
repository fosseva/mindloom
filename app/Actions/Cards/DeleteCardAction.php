<?php

namespace App\Actions\Cards;

use App\Models\Card;

class DeleteCardAction
{
    public function __invoke(Card $card): void
    {
        $card->delete();
    }
}
