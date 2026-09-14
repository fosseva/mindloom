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

/** @property CardType $type */
#[Fillable(['deck_id', 'type', 'sort_order', 'archived_at'])]
class Card extends Model
{
    /** @use HasFactory<CardFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return ['type' => CardType::class, 'archived_at' => 'datetime'];
    }

    /** @return BelongsTo<Deck, $this> */
    public function deck(): BelongsTo
    {
        return $this->belongsTo(Deck::class);
    }

    /** @return HasOne<RememberCard, $this> */
    public function rememberCard(): HasOne
    {
        return $this->hasOne(RememberCard::class);
    }

    /** @return HasOne<ExplainCard, $this> */
    public function explainCard(): HasOne
    {
        return $this->hasOne(ExplainCard::class);
    }

    /** @return HasOne<ApplyCard, $this> */
    public function applyCard(): HasOne
    {
        return $this->hasOne(ApplyCard::class);
    }

    /** @return HasOne<NoteCard, $this> */
    public function noteCard(): HasOne
    {
        return $this->hasOne(NoteCard::class);
    }

    /** @return HasMany<LearningRecord, $this> */
    public function learningRecords(): HasMany
    {
        return $this->hasMany(LearningRecord::class);
    }
}
