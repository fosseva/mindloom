<?php

namespace App\Http\Includes;

use App\Models\Card;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Includes\IncludeInterface;

/** @implements IncludeInterface<Card> */
class CardContentInclude implements IncludeInterface
{
    public function __invoke(Builder $query, string $include): void
    {
        $query->with([
            'rememberCard',
            'explainCard',
            'applyCard',
            'noteCard',
        ]);
    }
}
