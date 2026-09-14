<?php

namespace App\Http\Resources;

use App\Models\CardReview;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CardReview */
class CardReviewResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'card_id' => $this->learningRecord?->card_id, 'rating' => $this->rating->value, 'reviewed_at' => $this->reviewed_at, 'interval_before_minutes' => $this->interval_before_minutes, 'interval_after_minutes' => $this->interval_after_minutes, 'due_at_before' => $this->due_at_before, 'due_at_after' => $this->due_at_after, 'duration_ms' => $this->duration_ms];
    }
}
