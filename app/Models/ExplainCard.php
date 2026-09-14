<?php

namespace App\Models;

use Database\Factories\ExplainCardFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['prompt', 'explanation', 'key_points', 'example'])]
class ExplainCard extends Model
{
    /** @use HasFactory<ExplainCardFactory> */
    use HasFactory;

    protected $primaryKey = 'card_id';

    public $incrementing = false;

    /** @return BelongsTo<Card, $this> */
    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }
}
