<?php

use App\Models\User;

test('authenticated users can list card types with their ratings', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->getJson('/api/v1/card-types')
        ->assertOk()
        ->assertJsonCount(4, 'data')
        ->assertJsonPath('data.0.name', 'remember')
        ->assertJsonPath('data.0.ratings.0.name', 'Missed')
        ->assertJsonPath('data.0.ratings.0.recall_quality', 1);
});

test('unauthenticated users cannot list card types', function () {
    $this->getJson('/api/v1/card-types')->assertUnauthorized();
});
