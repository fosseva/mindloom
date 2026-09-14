<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('a frontend user can establish and end a Sanctum SPA session', function () {
    $user = User::factory()->create(['email' => 'learner@example.com', 'password' => Hash::make('secret-password')]);
    $this->withHeader('Referer', 'http://localhost:5174')->postJson('/api/v1/session', ['email' => $user->email, 'password' => 'secret-password'])->assertOk()->assertJsonPath('data.id', $user->id);
    $this->assertAuthenticatedAs($user);
    $this->getJson('/api/v1/session')->assertOk()->assertJsonPath('data.email', $user->email);
    $this->deleteJson('/api/v1/session')->assertNoContent();
    $this->getJson('/api/v1/session')->assertUnauthorized();
});
test('invalid SPA credentials are rejected', function () {
    User::factory()->create(['email' => 'learner@example.com']);
    $this->withHeader('Referer', 'http://localhost:5174')->postJson('/api/v1/session', ['email' => 'learner@example.com', 'password' => 'wrong'])->assertUnprocessable()->assertJsonValidationErrors('email');
});
