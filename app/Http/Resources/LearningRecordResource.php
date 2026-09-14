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
        return ['due_at' => $this->due_at, 'last_reviewed_at' => $this->last_reviewed_at, 'review_count' => $this->review_count, 'current_interval_minutes' => $this->current_interval_minutes, 'scheduler_version' => $this->scheduler_version];
    }
}
