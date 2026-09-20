<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Cards\CreateCardAction;
use App\Actions\Cards\DeleteCardAction;
use App\Actions\Cards\UpdateCardAction;
use App\Http\Controllers\Controller;
use App\Http\Includes\CardContentInclude;
use App\Http\Includes\ViewerLearningRecordInclude;
use App\Http\Requests\DeleteCardRequest;
use App\Http\Requests\StoreCardRequest;
use App\Http\Requests\UpdateCardRequest;
use App\Http\Requests\ViewCardRequest;
use App\Http\Requests\ViewDeckRequest;
use App\Http\Resources\CardResource;
use App\Models\Card;
use App\Models\Deck;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedInclude;
use Spatie\QueryBuilder\QueryBuilder;

class CardController extends Controller
{
    public function index(ViewDeckRequest $request, Deck $deck): AnonymousResourceCollection
    {
        $cards = $this->query($deck->cards()->getQuery(), $request->user()->id)
            ->defaultSort('sort_order')
            ->paginate();

        return CardResource::collection($cards);
    }

    public function store(StoreCardRequest $request, Deck $deck, CreateCardAction $action): CardResource
    {
        return new CardResource($action($request->user(), $deck, $request->validated()));
    }

    public function show(ViewCardRequest $request, Card $card): CardResource
    {
        return new CardResource($this->query(Card::query()->whereKey($card), $request->user()->id)->firstOrFail());
    }

    public function update(UpdateCardRequest $request, Card $card, UpdateCardAction $action): CardResource
    {
        return new CardResource($action($card, $request->validated()));
    }

    public function destroy(DeleteCardRequest $request, Card $card, DeleteCardAction $action): Response
    {
        $action($card);

        return response()->noContent();
    }

    private function query(Builder $query, int $userId): QueryBuilder
    {
        return QueryBuilder::for($query)
            ->allowedFilters(
                AllowedFilter::exact('type', 'type.name'),
                AllowedFilter::callback(
                    'archived',
                    fn (Builder $query, mixed $value) => $value
                        ? $query->whereNotNull('archived_at')
                        : $query->whereNull('archived_at'),
                ),
            )
            ->allowedSorts('sort_order', 'created_at')
            ->allowedIncludes(
                'type.ratings',
                AllowedInclude::custom('content', new CardContentInclude),
                AllowedInclude::custom('learning_record', new ViewerLearningRecordInclude($userId)),
            );
    }
}
