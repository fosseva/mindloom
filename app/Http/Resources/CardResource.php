<?php

namespace App\Http\Resources;

use App\Models\Card;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Card */
class CardResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'deck_id' => $this->deck_id,
            'type_id' => $this->type_id,
            'type' => new CardTypeResource($this->whenLoaded('type')),
            'sort_order' => $this->sort_order,
            'archived_at' => $this->archived_at,
            'content' => $this->when(
                $this->relationLoaded('type'),
                function () {
                    $relationship = $this->type->name->relationship();

                    return $this->whenLoaded(
                        $relationship,
                        fn () => $this->{$relationship}?->only($this->type->name->fields()) ?? [],
                    );
                },
            ),
            'learning_record' => new LearningRecordResource($this->whenLoaded(
                'learningRecords',
                fn () => $this->learningRecords->firstWhere('user_id', $request->user()?->id),
            )),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
