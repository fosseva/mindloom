<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CardTypeResource;
use App\Models\CardType;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\QueryBuilder;

class CardTypeController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $cardTypes = QueryBuilder::for(CardType::query()->orderBy('id'))
            ->allowedFilters('name')
            ->allowedIncludes('ratings')
            ->get();

        return CardTypeResource::collection($cardTypes);
    }
}
