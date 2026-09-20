<?php

namespace App\Http\Resources;

use App\Models\CardType;
use App\Models\Rating;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CardType */
class CardTypeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name->value,
            'description' => $this->description,
            'ratings' => RatingResource::collection($this->whenLoaded(
                'ratings',
                fn () => $this->ratings
                    ->sortBy(fn (Rating $rating): int => $rating->recall_quality->value)
                    ->values(),
            )),
        ];
    }
}
