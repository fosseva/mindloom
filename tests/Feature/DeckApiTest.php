<?php

use App\Enums\CardTypeName;
use App\Models\CardType;
use App\Models\Deck;
use App\Models\User;

test('an authenticated user can create a deck', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->postJson('/api/v1/decks', [
        'name' => 'CTO Fundamentals',
        'description' => 'Concepts worth internalizing.',
    ])->assertCreated()
        ->assertJsonPath('data.name', 'CTO Fundamentals');

    $this->assertDatabaseHas('decks', ['owner_id' => $user->id, 'name' => 'CTO Fundamentals']);
});

test('a user cannot modify another users deck', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $deck = Deck::factory()->for($owner, 'owner')->create();

    $this->actingAs($otherUser)->patchJson("/api/v1/decks/{$deck->id}", ['name' => 'Taken over'])
        ->assertForbidden();

    expect($deck->refresh()->name)->not->toBe('Taken over');
});

test('deck names do not have to be unique', function () {
    $user = User::factory()->create();
    Deck::factory()->for($user, 'owner')->create(['name' => 'Leadership']);

    $this->actingAs($user)->postJson('/api/v1/decks', ['name' => 'Leadership'])->assertCreated();

    expect($user->ownedDecks()->where('name', 'Leadership')->count())->toBe(2);
});

test('decks can be filtered included and sorted by each users preference', function () {
    $user = User::factory()->create();
    $later = $this->actingAs($user)->postJson('/api/v1/decks', ['name' => 'Laravel', 'sort_order' => 20])->json('data.id');
    $first = $this->actingAs($user)->postJson('/api/v1/decks', ['name' => 'Leadership', 'sort_order' => 5])->json('data.id');

    $this->getJson('/api/v1/decks?filter[name]=Leader&include=cards_count&sort=sort_order')
        ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $first)->assertJsonPath('data.0.cards_count', 0);

    $this->assertDatabaseHas('user_deck_preferences', ['user_id' => $user->id, 'deck_id' => $later, 'sort_order' => 20]);
    $this->assertDatabaseHas('user_deck_preferences', ['user_id' => $user->id, 'deck_id' => $first, 'sort_order' => 5]);
});

test('cards_count and archived_cards_count only count cards on their own side of the archive', function () {
    $user = User::factory()->create();
    $deck = Deck::factory()->for($user, 'owner')->create();
    $rememberType = CardType::query()->where('name', CardTypeName::Remember)->firstOrFail();
    $active = $this->actingAs($user)->postJson("/api/v1/decks/{$deck->id}/cards", ['type_id' => $rememberType->id, 'question' => 'Q1', 'answer' => 'A1'])->json('data.id');
    $archived = $this->actingAs($user)->postJson("/api/v1/decks/{$deck->id}/cards", ['type_id' => $rememberType->id, 'question' => 'Q2', 'answer' => 'A2'])->json('data.id');
    $this->actingAs($user)->patchJson("/api/v1/cards/{$archived}", ['archived_at' => now()->toISOString()])->assertOk();

    $this->actingAs($user)->getJson('/api/v1/decks?include=cards_count,archived_cards_count')
        ->assertOk()
        ->assertJsonPath('data.0.cards_count', 1)
        ->assertJsonPath('data.0.archived_cards_count', 1);

    $this->assertDatabaseHas('cards', ['id' => $active, 'archived_at' => null]);
});
