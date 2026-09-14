<?php

namespace App\Models;

use Database\Factories\CardReviewFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['learning_record_id', 'rating_id', 'reviewed_at', 'interval_before_minutes', 'interval_after_minutes', 'due_at_before', 'due_at_after', 'duration_ms'])]
class CardReview extends Model
{
    /** @use HasFactory<CardReviewFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['reviewed_at' => 'datetime', 'due_at_before' => 'datetime', 'due_at_after' => 'datetime'];
    }

    /** @return BelongsTo<LearningRecord, $this> */
    public function learningRecord(): BelongsTo
    {
        return $this->belongsTo(LearningRecord::class);
    }

    /** @return BelongsTo<Rating, $this> */
    public function rating(): BelongsTo
    {
        return $this->belongsTo(Rating::class);
    }
}
