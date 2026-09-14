<?php

use App\Enums\CardType;
use App\Models\Card;
use App\Models\Deck;
use App\Models\LearningRecord;
use App\Models\RememberCard;
use App\Models\User;

test('recording a review updates progress and creates immutable history data', function () {
    $user = User::factory()->create();
    $deck = Deck::factory()->for($user, 'owner')->create();
    $card = Card::factory()->for($deck)->create(['type' => CardType::Remember]);
    RememberCard::factory()->create(['card_id' => $card->id]);
    $learningRecord = LearningRecord::factory()->create(['user_id' => $user->id, 'card_id' => $card->id, 'due_at' => now(), 'interval_minutes' => 0]);
    $reviewedAt = now()->startOfSecond();

    $this->actingAs($user)->postJson("/api/v1/cards/{$card->id}/reviews", ['rating' => 3, 'reviewed_at' => $reviewedAt->toISOString(), 'duration_ms' => 4200])
        ->assertCreated()
        ->assertJsonPath('data.rating', 3)
        ->assertJsonPath('data.interval_after_minutes', 4320);

    $learningRecord->refresh();
    expect($learningRecord->review_count)->toBe(1)
        ->and($learningRecord->interval_minutes)->toBe(4320)
        ->and($learningRecord->due_at->greaterThan($reviewedAt))->toBeTrue();
    $this->assertDatabaseHas('card_reviews', ['learning_record_id' => $learningRecord->id, 'rating' => 3, 'interval_before_minutes' => 0, 'interval_after_minutes' => 4320, 'duration_ms' => 4200]);
});

test('a user cannot review another users card', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $deck = Deck::factory()->for($owner, 'owner')->create();
    $card = Card::factory()->for($deck)->create();
    RememberCard::factory()->create(['card_id' => $card->id]);
    LearningRecord::factory()->create(['user_id' => $owner->id, 'card_id' => $card->id]);

    $this->actingAs($otherUser)->postJson("/api/v1/cards/{$card->id}/reviews", ['rating' => 4])->assertForbidden();

    $this->assertDatabaseCount('card_reviews', 0);
});
