<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Decks\CreateDeckAction;
use App\Actions\Decks\DeleteDeckAction;
use App\Actions\Decks\UpdateDeckAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\DeleteDeckRequest;
use App\Http\Requests\StoreDeckRequest;
use App\Http\Requests\UpdateDeckRequest;
use App\Http\Requests\ViewDeckRequest;
use App\Http\Resources\DeckResource;
use App\Models\Deck;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedInclude;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

class DeckController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = $this->forUser($request->user())->whereBelongsTo($request->user());
        $decks = $this->query($query)->defaultSort('user_sort_order')->paginate($request->integer('per_page') ?: 15);

        return DeckResource::collection($decks);
    }

    public function store(StoreDeckRequest $request, CreateDeckAction $action): DeckResource
    {
        return new DeckResource($action($request->user(), $request->validated()));
    }

    public function show(ViewDeckRequest $request, Deck $deck): DeckResource
    {
        return new DeckResource($this->query($this->forUser($request->user())->whereKey($deck))->firstOrFail());
    }

    public function update(UpdateDeckRequest $request, Deck $deck, UpdateDeckAction $action): DeckResource
    {
        return new DeckResource($action($request->user(), $deck, $request->validated()));
    }

    public function destroy(DeleteDeckRequest $request, Deck $deck, DeleteDeckAction $action): Response
    {
        $action($deck);

        return response()->noContent();
    }

    private function query(Builder $query): QueryBuilder
    {
        return QueryBuilder::for($query)
            ->allowedFilters(AllowedFilter::partial('name'), AllowedFilter::callback('archived', fn (Builder $query, mixed $value) => $value ? $query->whereNotNull('archived_at') : $query->whereNull('archived_at')))
            ->allowedSorts('name', 'created_at', AllowedSort::field('sort_order', 'user_sort_order'))
            ->allowedIncludes(
                AllowedInclude::count('cards_count', 'cards as cards_count', fn (Builder $query) => $query->whereNull('archived_at')),
                AllowedInclude::count('archived_cards_count', 'cards as archived_cards_count', fn (Builder $query) => $query->whereNotNull('archived_at')),
            );
    }

    private function forUser(User $user): Builder
    {
        return Deck::query()
            ->leftJoin('user_deck_preferences', fn ($join) => $join->on('decks.id', '=', 'user_deck_preferences.deck_id')->where('user_deck_preferences.user_id', $user->id))
            ->select('decks.*')
            ->addSelect('user_deck_preferences.sort_order as user_sort_order');
    }
}
