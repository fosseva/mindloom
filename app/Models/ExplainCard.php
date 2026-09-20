<?php

namespace App\Models;

use Database\Factories\ExplainCardFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\WithoutIncrementing;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['prompt', 'explanation', 'key_points', 'example'])]
#[WithoutIncrementing]
class ExplainCard extends Model
{
    /** @use HasFactory<ExplainCardFactory> */
    use HasFactory;

    protected $primaryKey = 'card_id';

    /** @return BelongsTo<Card, $this> */
    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }
}
