<?php

namespace App\Actions\Decks;

use App\Models\Deck;

class DeleteDeckAction
{
    public function __invoke(Deck $deck): void
    {
        $deck->delete();
    }
}
