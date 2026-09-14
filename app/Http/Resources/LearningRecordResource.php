<?php

namespace App\Http\Resources;

use App\Models\LearningRecord;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin LearningRecord */
class LearningRecordResource extends JsonResource
{
    /** @return array<string,mixed> */
    public function toArray(Request $request): array
    {
        return ['due_at' => $this->due_at, 'last_reviewed_at' => $this->last_reviewed_at, 'review_count' => $this->review_count, 'lapse_count' => $this->lapse_count, 'interval_days' => $this->interval_days, 'learning_state' => $this->learning_state->value, 'paused_at' => $this->paused_at];
    }
}
