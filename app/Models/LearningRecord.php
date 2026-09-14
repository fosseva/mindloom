<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\LearningRecordFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property CarbonInterface|null $last_reviewed_at
 * @property float|null $stability_days
 * @property float|null $difficulty_score
 * @property int $review_count
 * @property int $current_interval_minutes
 */
#[Fillable(['user_id', 'card_id', 'due_at', 'last_reviewed_at', 'review_count', 'current_interval_minutes', 'stability_days', 'difficulty_score'])]
class LearningRecord extends Model
{
    /** @use HasFactory<LearningRecordFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['due_at' => 'datetime', 'last_reviewed_at' => 'datetime', 'stability_days' => 'float', 'difficulty_score' => 'float'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Card, $this> */
    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }

    /** @return HasMany<CardReview, $this> */
    public function reviews(): HasMany
    {
        return $this->hasMany(CardReview::class);
    }
}
