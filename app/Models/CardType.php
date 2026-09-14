<?php

namespace App\Models;

use App\Enums\CardTypeName;
use Database\Factories\CardTypeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** @property CardTypeName $name */
#[Fillable(['name', 'description'])]
class CardType extends Model
{
    /** @use HasFactory<CardTypeFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['name' => CardTypeName::class];
    }

    /** @return HasMany<Card, $this> */
    public function cards(): HasMany
    {
        return $this->hasMany(Card::class, 'type_id');
    }

    /** @return HasMany<Rating, $this> */
    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }
}
