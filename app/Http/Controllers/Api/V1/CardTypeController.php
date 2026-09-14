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
        $cardTypes = QueryBuilder::for(CardType::query()->with(['ratings' => fn ($query) => $query->orderBy('recall_quality')])->orderBy('id'))
            ->allowedFilters('name')
            ->get();

        return CardTypeResource::collection($cardTypes);
    }
}
