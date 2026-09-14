<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CardResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DueCardController extends Controller
{
    public function __invoke(Request $request): AnonymousResourceCollection
    {
        $learningRecords = $request->user()->learningRecords()
            ->whereHas('card', fn ($query) => $query->whereNull('archived_at')->whereHas('deck', fn ($deckQuery) => $deckQuery->whereNull('archived_at')))
            ->where(fn ($query) => $query->whereNull('due_at')->orWhere('due_at', '<=', now()))
            ->with(['card.rememberCard', 'card.explainCard', 'card.applyCard', 'card.noteCard', 'card.learningRecords' => fn ($query) => $query->whereBelongsTo($request->user())])
            ->orderByRaw('due_at IS NOT NULL')
            ->orderBy('due_at')
            ->paginate();

        return CardResource::collection($learningRecords->through(fn ($item) => $item->card));
    }
}
