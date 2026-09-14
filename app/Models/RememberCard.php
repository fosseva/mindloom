<?php

namespace App\Models;

use Database\Factories\RememberCardFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['question', 'answer', 'hint', 'notes'])]
class RememberCard extends Model
{
    /** @use HasFactory<RememberCardFactory> */
    use HasFactory;

    protected $primaryKey = 'card_id';

    public $incrementing = false;

    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }
}
