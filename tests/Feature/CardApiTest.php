<?php

use App\Enums\CardTypeName;
use App\Models\Card;
use App\Models\CardType;
use App\Models\Deck;
use App\Models\LearningRecord;
use App\Models\NoteCard;
use App\Models\RememberCard;
use App\Models\User;

dataset('card payloads', [
    'remember' => [CardTypeName::Remember, ['question' => 'What is idempotency?', 'answer' => 'Repeating the operation has the same effect.', 'hint' => 'Think retries.'], 'remember_cards'],
    'explain' => [CardTypeName::Explain, ['prompt' => 'Explain eventual consistency.', 'explanation' => 'Replicas converge over time.', 'key_points' => 'Temporary divergence is expected.'], 'explain_cards'],
    'apply' => [CardTypeName::Apply, ['scenario' => 'Reads greatly outnumber writes.', 'question' => 'How can replication help?', 'solution' => 'Serve reads from replicas.'], 'apply_cards'],
    'note' => [CardTypeName::Note, ['title' => 'Reversible decisions', 'content' => 'Prefer reversible decisions when speed matters.'], 'note_cards'],
]);

test('a user can create every supported card type with subtype content and progress', function (CardTypeName $type, array $content, string $table) {
    $user = User::factory()->create();
    $deck = Deck::factory()->for($user, 'owner')->create();

    $cardType = CardType::query()->where('name', $type)->firstOrFail();
    $response = $this->actingAs($user)->postJson("/api/v1/decks/{$deck->id}/cards", ['type_id' => $cardType->id, ...$content]);

    $response->assertCreated()->assertJsonPath('data.type.name', $type->value)->assertJsonPath('data.type_id', $cardType->id);
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
    'remember answer' => ['remember', ['question' => 'Question'], ['answer']],
    'explain explanation' => ['explain', ['prompt' => 'Prompt'], ['explanation']],
    'apply solution' => ['apply', ['scenario' => 'Scenario', 'question' => 'Question'], ['solution']],
    'note content' => ['note', ['title' => 'Title'], ['content']],
]);

test('a user can update archive and delete their card', function () {
    $user = User::factory()->create();
    $deck = Deck::factory()->for($user, 'owner')->create();
    $card = Card::factory()->for($deck)->forType(CardTypeName::Remember)->create();
    RememberCard::factory()->create(['card_id' => $card->id, 'question' => 'Old question']);

    $this->actingAs($user)->patchJson("/api/v1/cards/{$card->id}", ['question' => 'Better question', 'archived_at' => now()->toISOString()])
        ->assertOk()
        ->assertJsonPath('data.content.question', 'Better question');

    expect($card->refresh()->archived_at)->not->toBeNull();

    $this->actingAs($user)->deleteJson("/api/v1/cards/{$card->id}")->assertNoContent();
    $this->assertSoftDeleted('cards', ['id' => $card->id]);
});

test('due cards only contain accessible cards that are currently due', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $deck = Deck::factory()->for($user, 'owner')->create();
    $otherDeck = Deck::factory()->for($otherUser, 'owner')->create();
    $dueCard = Card::factory()->for($deck)->create();
    $futureCard = Card::factory()->for($deck)->create();
    $otherCard = Card::factory()->for($otherDeck)->create();
    foreach ([$dueCard, $futureCard, $otherCard] as $card) {
        RememberCard::factory()->create(['card_id' => $card->id]);
    }
    LearningRecord::factory()->create(['user_id' => $user->id, 'card_id' => $dueCard->id, 'due_at' => now()->subMinute()]);
    LearningRecord::factory()->create(['user_id' => $user->id, 'card_id' => $futureCard->id, 'due_at' => now()->addDay()]);
    LearningRecord::factory()->create(['user_id' => $otherUser->id, 'card_id' => $otherCard->id, 'due_at' => now()->subMinute()]);

    $this->actingAs($user)->getJson('/api/v1/cards/due')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $dueCard->id);
});

test('cards can be filtered by type and include their deck', function () {
    $user = User::factory()->create();
    $deck = Deck::factory()->for($user, 'owner')->create();
    $remember = Card::factory()->for($deck)->forType(CardTypeName::Remember)->create();
    RememberCard::factory()->create(['card_id' => $remember->id]);
    $note = Card::factory()->for($deck)->forType(CardTypeName::Note)->create();
    NoteCard::factory()->create(['card_id' => $note->id]);

    $this->actingAs($user)->getJson("/api/v1/decks/{$deck->id}/cards?filter[type]=note&include=deck")
        ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $note->id)->assertJsonPath('data.0.deck.id', $deck->id);
});
