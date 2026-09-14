<?php

namespace App\Models;

use App\Enums\CardType;
use Database\Factories\CardFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['deck_id', 'type', 'sort_order', 'archived_at'])]
class Card extends Model
{
    /** @use HasFactory<CardFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return ['type' => CardType::class, 'archived_at' => 'datetime'];
    }

    public function deck(): BelongsTo
    {
        return $this->belongsTo(Deck::class);
    }

    public function rememberCard(): HasOne
    {
        return $this->hasOne(RememberCard::class);
    }

    public function explainCard(): HasOne
    {
        return $this->hasOne(ExplainCard::class);
    }

    public function applyCard(): HasOne
    {
        return $this->hasOne(ApplyCard::class);
    }

    public function noteCard(): HasOne
    {
        return $this->hasOne(NoteCard::class);
    }

    public function learningRecords(): HasMany
    {
        return $this->hasMany(LearningRecord::class);
    }
}
