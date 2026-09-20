<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Includes\CardContentInclude;
use App\Http\Includes\ViewerLearningRecordInclude;
use App\Http\Resources\CardResource;
use App\Models\Card;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedInclude;
use Spatie\QueryBuilder\QueryBuilder;

class DueCardController extends Controller
{
    public function __invoke(Request $request): AnonymousResourceCollection
    {
        $cards = QueryBuilder::for(
            Card::query()
                ->join('learning_records', fn (JoinClause $join) => $join
                    ->on('learning_records.card_id', '=', 'cards.id')
                    ->where('learning_records.user_id', $request->user()->id))
                ->whereNull('cards.archived_at')
                ->whereHas('deck', fn (Builder $query) => $query->whereNull('archived_at'))
                ->where(fn (Builder $query) => $query
                    ->whereNull('learning_records.due_at')
                    ->orWhere('learning_records.due_at', '<=', now()))
                ->select('cards.*')
                ->orderByRaw('learning_records.due_at IS NOT NULL')
                ->orderBy('learning_records.due_at'),
        )
            ->allowedIncludes(
                'type.ratings',
                AllowedInclude::custom('content', new CardContentInclude),
                AllowedInclude::custom(
                    'learning_record',
                    new ViewerLearningRecordInclude($request->user()->id),
                ),
            )
            ->paginate();

        return CardResource::collection($cards);
    }
}
