<?php

namespace App\Enums;

enum CardTypeName: string
{
    case Remember = 'Remember';
    case Explain = 'Explain';
    case Apply = 'Apply';
    case Note = 'Note';

    public function relationship(): string
    {
        return match ($this) {
            self::Remember => 'rememberCard',
            self::Explain => 'explainCard',
            self::Apply => 'applyCard',
            self::Note => 'noteCard'
        };
    }

    /** @return list<string> */
    public function fields(): array
    {
        return match ($this) {
            self::Remember => ['question', 'answer', 'hint', 'notes'],
            self::Explain => ['prompt', 'explanation', 'key_points', 'example'],
            self::Apply => ['scenario', 'question', 'solution', 'key_takeaway'],
            self::Note => ['title', 'content', 'author', 'source']
        };
    }
}
