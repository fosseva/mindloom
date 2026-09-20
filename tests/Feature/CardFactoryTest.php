<?php

use App\Enums\CardTypeName;
use App\Models\ApplyCard;
use App\Models\Card;
use App\Models\ExplainCard;
use App\Models\NoteCard;
use App\Models\RememberCard;

test('named states create complete cards for every supported type', function () {
    $remember = Card::factory()->remember()->create();
    $explain = Card::factory()->explain()->create();
    $apply = Card::factory()->apply()->create();
    $note = Card::factory()->note()->create();

    expect($remember->type->name)->toBe(CardTypeName::Remember)
        ->and($remember->rememberCard)->toBeInstanceOf(RememberCard::class)
        ->and($explain->type->name)->toBe(CardTypeName::Explain)
        ->and($explain->explainCard)->toBeInstanceOf(ExplainCard::class)
        ->and($apply->type->name)->toBe(CardTypeName::Apply)
        ->and($apply->applyCard)->toBeInstanceOf(ApplyCard::class)
        ->and($note->type->name)->toBe(CardTypeName::Note)
        ->and($note->noteCard)->toBeInstanceOf(NoteCard::class);
});
