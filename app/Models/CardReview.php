<?php

namespace App\Models;

use App\Enums\ReviewRating;
use Database\Factories\CardReviewFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** @property ReviewRating $rating */
#[Fillable(['learning_record_id', 'rating', 'reviewed_at', 'interval_before_days', 'interval_after_days', 'due_at_before', 'due_at_after', 'duration_ms'])]
class CardReview extends Model
{
    /** @use HasFactory<CardReviewFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['rating' => ReviewRating::class, 'reviewed_at' => 'datetime', 'due_at_before' => 'datetime', 'due_at_after' => 'datetime'];
    }

    /** @return BelongsTo<LearningRecord, $this> */
    public function learningRecord(): BelongsTo
    {
        return $this->belongsTo(LearningRecord::class);
    }
}
