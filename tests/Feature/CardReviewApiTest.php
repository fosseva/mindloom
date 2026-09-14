<?php

use App\Enums\CardTypeName;
use App\Enums\RecallQuality;
use App\Enums\SchedulerVersion;
use App\Models\Card;
use App\Models\Deck;
use App\Models\LearningRecord;
use App\Models\Rating;
use App\Models\RememberCard;
use App\Models\User;

test('recording a review updates memory data and creates immutable history', function () {
    $user = User::factory()->create();
    $deck = Deck::factory()->for($user, 'owner')->create();
    $card = Card::factory()->for($deck)->forType(CardTypeName::Remember)->create();
    RememberCard::factory()->create(['card_id' => $card->id]);
    $learningRecord = LearningRecord::factory()->create(['user_id' => $user->id, 'card_id' => $card->id, 'due_at' => now(), 'current_interval_minutes' => 0]);
    $rating = Rating::query()->whereBelongsTo($card->type, 'cardType')->where('recall_quality', RecallQuality::Remembered)->firstOrFail();
    $reviewedAt = now()->startOfSecond();
    $this->travelTo($reviewedAt);

    $this->actingAs($user)->postJson("/api/v1/cards/{$card->id}/reviews", ['rating_id' => $rating->id, 'duration_ms' => 4200])
        ->assertCreated()
        ->assertJsonPath('data.rating_id', $rating->id)
        ->assertJsonPath('data.rating.recall_quality', RecallQuality::Remembered->value)
        ->assertJsonPath('data.scheduler_version', 'fsrs_6')
        ->assertJsonPath('data.interval_after_minutes', 3321);

    $learningRecord->refresh();
    expect($learningRecord->review_count)->toBe(1)
        ->and($learningRecord->current_interval_minutes)->toBe(3321)
        ->and($learningRecord->stability_days)->toBe(2.3065)
        ->and($learningRecord->difficulty_score)->toBeGreaterThanOrEqual(1.0)
        ->and($learningRecord->scheduler_version)->toBe(SchedulerVersion::Fsrs6)
        ->and($learningRecord->due_at->greaterThan($reviewedAt))->toBeTrue();
    $this->assertDatabaseHas('card_reviews', ['learning_record_id' => $learningRecord->id, 'rating_id' => $rating->id, 'scheduler_version' => 'fsrs_6', 'interval_before_minutes' => 0, 'interval_after_minutes' => 3321, 'duration_ms' => 4200]);
});

test('a rating belonging to another card type is rejected', function () {
    $user = User::factory()->create();
    $deck = Deck::factory()->for($user, 'owner')->create();
    $card = Card::factory()->for($deck)->forType(CardTypeName::Remember)->create();
    LearningRecord::factory()->create(['user_id' => $user->id, 'card_id' => $card->id]);
    $rating = Rating::query()->whereHas('cardType', fn ($query) => $query->where('name', CardTypeName::Note))->firstOrFail();

    $this->actingAs($user)->postJson("/api/v1/cards/{$card->id}/reviews", ['rating_id' => $rating->id])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('rating_id');

    $this->assertDatabaseCount('card_reviews', 0);
});

test('a user cannot review another users card', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $deck = Deck::factory()->for($owner, 'owner')->create();
    $card = Card::factory()->for($deck)->create();
    RememberCard::factory()->create(['card_id' => $card->id]);
    LearningRecord::factory()->create(['user_id' => $owner->id, 'card_id' => $card->id]);
    $rating = Rating::query()->whereBelongsTo($card->type, 'cardType')->firstOrFail();

    $this->actingAs($otherUser)->postJson("/api/v1/cards/{$card->id}/reviews", ['rating_id' => $rating->id])->assertForbidden();

    $this->assertDatabaseCount('card_reviews', 0);
});
