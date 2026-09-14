<?php

namespace App\Models;

use App\Enums\RecallQuality;
use Database\Factories\RatingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** @property RecallQuality $recall_quality */
#[Fillable(['card_type_id', 'name', 'description', 'recall_quality'])]
class Rating extends Model
{
    /** @use HasFactory<RatingFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['recall_quality' => RecallQuality::class];
    }

    /** @return BelongsTo<CardType, $this> */
    public function cardType(): BelongsTo
    {
        return $this->belongsTo(CardType::class);
    }

    /** @return HasMany<CardReview, $this> */
    public function reviews(): HasMany
    {
        return $this->hasMany(CardReview::class);
    }
}
