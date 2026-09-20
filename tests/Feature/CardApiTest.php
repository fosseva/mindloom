<?php

use App\Enums\CardTypeName;
use App\Models\Card;
use App\Models\CardType;
use App\Models\Deck;
use App\Models\LearningRecord;
use App\Models\User;
use Illuminate\Support\Facades\DB;

test('learning record includes load only the viewer progress in one bulk query', function (string $endpoint, string $path) {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $deck = Deck::factory()->for($user, 'owner')->create();
    $cards = Card::factory()->count(3)->for($deck)->remember()->create();

    foreach ($cards as $card) {
        LearningRecord::factory()->for($card)->for($otherUser)->create(['review_count' => 99]);
        LearningRecord::factory()->for($card)->for($user)->create(['review_count' => 7, 'due_at' => now()->subMinute()]);
    }

    $url = match ($endpoint) {
        'index' => "/api/v1/decks/{$deck->id}/cards",
        'show' => "/api/v1/cards/{$cards->first()->id}",
        'due' => '/api/v1/cards/due',
    };
    DB::enableQueryLog();
    DB::flushQueryLog();

    $response = $this->actingAs($user)->getJson($url.'?include=learning_record');

    $queries = collect(DB::getQueryLog())->filter(fn (array $query): bool => str_contains($query['query'], 'from "learning_records"'));
    DB::disableQueryLog();
    $response->assertOk()->assertJsonPath($path.'.learning_record.review_count', 7);
    expect($queries)->toHaveCount(1);
})->with([
    'list' => ['index', 'data.0'],
    'detail' => ['show', 'data'],
    'due' => ['due', 'data.0'],
]);

test('a requested learning record is null when only another user has progress', function () {
    $user = User::factory()->create();
    $deck = Deck::factory()->for($user, 'owner')->create();
    $card = Card::factory()->for($deck)->remember()->create();
    LearningRecord::factory()->for($card)->create(['review_count' => 99]);

    $this->actingAs($user)->getJson("/api/v1/cards/{$card->id}?include=learning_record")
        ->assertOk()
        ->assertJsonPath('data.learning_record', null);
});

test('viewer progress is omitted unless included', function () {
    $user = User::factory()->create();
    $deck = Deck::factory()->for($user, 'owner')->create();
    $card = Card::factory()->for($deck)->remember()->create();
    LearningRecord::factory()->for($card)->for($user)->create();

    $this->actingAs($user)->getJson("/api/v1/cards/{$card->id}")
        ->assertOk()
        ->assertJsonMissingPath('data.learning_record');
});

dataset('card payloads', [
    'remember' => [
        CardTypeName::Remember,
        [
            'question' => 'What is idempotency?',
            'answer' => 'Repeating the operation has the same effect.',
            'hint' => 'Think retries.',
        ],
        'remember_cards',
    ],
    'explain' => [
        CardTypeName::Explain,
        [
            'prompt' => 'Explain eventual consistency.',
            'explanation' => 'Replicas converge over time.',
            'key_points' => 'Temporary divergence is expected.',
        ],
        'explain_cards',
    ],
    'apply' => [
        CardTypeName::Apply,
        [
            'scenario' => 'Reads greatly outnumber writes.',
            'question' => 'How can replication help?',
            'solution' => 'Serve reads from replicas.',
        ],
        'apply_cards',
    ],
    'note' => [
        CardTypeName::Note,
        [
            'title' => 'Reversible decisions',
            'content' => 'Prefer reversible decisions when speed matters.',
        ],
        'note_cards',
    ],
]);

test('a user can create every supported card type with subtype content and progress', function (
    CardTypeName $type,
    array $content,
    string $table,
) {
    $user = User::factory()->create();
    $deck = Deck::factory()->for($user, 'owner')->create();

    $cardType = CardType::query()->where('name', $type)->firstOrFail();
    $response = $this->actingAs($user)->postJson(
        "/api/v1/decks/{$deck->id}/cards",
        ['type_id' => $cardType->id, ...$content],
    );

    $response->assertCreated()
        ->assertJsonPath('data.type_id', $cardType->id)
        ->assertJsonMissingPath('data.type')
        ->assertJsonMissingPath('data.content')
        ->assertJsonMissingPath('data.learning_record');
    $cardId = $response->json('data.id');
    $this->assertDatabaseHas('cards', ['id' => $cardId, 'deck_id' => $deck->id, 'type_id' => $cardType->id]);
    $this->assertDatabaseHas($table, ['card_id' => $cardId]);
    $this->assertDatabaseHas('learning_records', ['card_id' => $cardId, 'user_id' => $user->id, 'review_count' => 0]);
})->with('card payloads');

test('card type specific required content is validated', function (string $type, array $payload, array $errors) {
    $user = User::factory()->create();
    $deck = Deck::factory()->for($user, 'owner')->create();

    $cardType = CardType::query()->where('name', $type)->firstOrFail();
    $this->actingAs($user)->postJson("/api/v1/decks/{$deck->id}/cards", ['type_id' => $cardType->id, ...$payload])
        ->assertUnprocessable()
        ->assertJsonValidationErrors($errors);
})->with([
    'remember answer' => ['Remember', ['question' => 'Question'], ['answer']],
    'explain explanation' => ['Explain', ['prompt' => 'Prompt'], ['explanation']],
    'apply solution' => ['Apply', ['scenario' => 'Scenario', 'question' => 'Question'], ['solution']],
    'note content' => ['Note', ['title' => 'Title'], ['content']],
]);

test('a user can update archive and delete their card', function () {
    $user = User::factory()->create();
    $deck = Deck::factory()->for($user, 'owner')->create();
    $card = Card::factory()->for($deck)->remember()->create();
    $card->rememberCard()->update(['question' => 'Old question']);

    $this->actingAs($user)->patchJson("/api/v1/cards/{$card->id}", [
        'question' => 'Better question',
        'archived_at' => now()->toISOString(),
    ])
        ->assertOk()
        ->assertJsonMissingPath('data.content');

    expect($card->refresh()->archived_at)->not->toBeNull();

    $this->actingAs($user)->deleteJson("/api/v1/cards/{$card->id}")->assertNoContent();
    $this->assertSoftDeleted('cards', ['id' => $card->id]);
});

test('due cards only contain accessible cards that are currently due', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $deck = Deck::factory()->for($user, 'owner')->create();
    $otherDeck = Deck::factory()->for($otherUser, 'owner')->create();
    $dueCard = Card::factory()->for($deck)->remember()->create();
    $futureCard = Card::factory()->for($deck)->remember()->create();
    $otherCard = Card::factory()->for($otherDeck)->remember()->create();
    LearningRecord::factory()->create([
        'user_id' => $user->id,
        'card_id' => $dueCard->id,
        'due_at' => now()->subMinute(),
    ]);
    LearningRecord::factory()->create([
        'user_id' => $otherUser->id,
        'card_id' => $dueCard->id,
        'review_count' => 5,
    ]);
    LearningRecord::factory()->create([
        'user_id' => $user->id,
        'card_id' => $futureCard->id,
        'due_at' => now()->addDay(),
    ]);
    LearningRecord::factory()->create([
        'user_id' => $otherUser->id,
        'card_id' => $otherCard->id,
        'due_at' => now()->subMinute(),
    ]);

    $this->actingAs($user)->getJson('/api/v1/cards/due?include=type.ratings,content,learning_record')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $dueCard->id)
        ->assertJsonPath('data.0.type.name', 'Remember')
        ->assertJsonPath('data.0.learning_record.review_count', 0);
});

test('cards can be filtered by type', function () {
    $user = User::factory()->create();
    $deck = Deck::factory()->for($user, 'owner')->create();
    $remember = Card::factory()->for($deck)->remember()->create();
    $note = Card::factory()->for($deck)->note()->create();

    $this->actingAs($user)->getJson("/api/v1/decks/{$deck->id}/cards?filter[type]=Note")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $note->id);
});
