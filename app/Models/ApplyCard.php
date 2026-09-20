<?php

namespace App\Models;

use Database\Factories\ApplyCardFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\WithoutIncrementing;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['scenario', 'question', 'solution', 'key_takeaway'])]
#[WithoutIncrementing]
class ApplyCard extends Model
{
    /** @use HasFactory<ApplyCardFactory> */
    use HasFactory;

    protected $primaryKey = 'card_id';

    /** @return BelongsTo<Card, $this> */
    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }
}
