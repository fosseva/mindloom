<?php

namespace App\Http\Resources;

use App\Models\Deck;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Deck */
class DeckResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'name' => $this->name, 'description' => $this->description, 'sort_order' => $this->user_sort_order ?? 0, 'archived_at' => $this->archived_at, 'cards_count' => $this->whenCounted('cards_count'), 'archived_cards_count' => $this->whenCounted('archived_cards_count'), 'created_at' => $this->created_at, 'updated_at' => $this->updated_at];
    }
}
