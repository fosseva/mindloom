<?php

use App\Models\User;

test('authenticated users can list card types with their ratings', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->getJson('/api/v1/card-types?include=ratings')
        ->assertOk()
        ->assertJsonCount(4, 'data')
        ->assertJsonPath('data.0.name', 'Remember')
        ->assertJsonPath('data.0.ratings.0.name', 'Missed')
        ->assertJsonPath('data.0.ratings.*.recall_quality', [1, 2, 3, 4]);
});

test('unauthenticated users cannot list card types', function () {
    $this->getJson('/api/v1/card-types')->assertUnauthorized();
});
