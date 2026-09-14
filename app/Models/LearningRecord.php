<?php

namespace App\Models;

use App\Enums\LearningState;
use Database\Factories\LearningRecordFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'card_id', 'due_at', 'last_reviewed_at', 'review_count', 'lapse_count', 'interval_days', 'learning_state', 'paused_at'])]
class LearningRecord extends Model
{
    /** @use HasFactory<LearningRecordFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['due_at' => 'datetime', 'last_reviewed_at' => 'datetime', 'learning_state' => LearningState::class, 'paused_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(CardReview::class);
    }
}
