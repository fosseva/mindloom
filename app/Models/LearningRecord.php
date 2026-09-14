<?php

namespace App\Models;

use App\Enums\LearningState;
use Database\Factories\LearningRecordFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** @property LearningState $learning_state */
#[Fillable(['user_id', 'card_id', 'due_at', 'last_reviewed_at', 'review_count', 'relearning_count', 'interval_minutes', 'learning_state'])]
class LearningRecord extends Model
{
    /** @use HasFactory<LearningRecordFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['due_at' => 'datetime', 'last_reviewed_at' => 'datetime', 'learning_state' => LearningState::class];
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
