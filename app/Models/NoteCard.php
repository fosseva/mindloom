<?php

namespace App\Models;

use Database\Factories\NoteCardFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['title', 'content', 'author', 'source'])]
class NoteCard extends Model
{
    /** @use HasFactory<NoteCardFactory> */
    use HasFactory;

    protected $primaryKey = 'card_id';

    public $incrementing = false;

    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }
}
