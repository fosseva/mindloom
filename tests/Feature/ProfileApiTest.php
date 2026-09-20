<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('an authenticated user can update their profile', function () {
    $user = User::factory()->create(['name' => 'Old Name', 'email' => 'old@example.com']);

    $this->actingAs($user)
        ->patchJson('/api/v1/user', ['name' => 'Ada Lovelace', 'email' => 'ada@example.com'])
        ->assertOk()
        ->assertJsonPath('data.name', 'Ada Lovelace')
        ->assertJsonPath('data.email', 'ada@example.com');

    expect($user->refresh())->name->toBe('Ada Lovelace')->email->toBe('ada@example.com');
});

test('profile updates require a unique email address', function () {
    User::factory()->create(['email' => 'taken@example.com']);
    $user = User::factory()->create(['email' => 'original@example.com']);

    $this->actingAs($user)
        ->patchJson('/api/v1/user', ['name' => 'Ada Lovelace', 'email' => 'taken@example.com'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');

    expect($user->refresh()->email)->toBe('original@example.com');
});

test('an authenticated user can change their password', function () {
    $user = User::factory()->create(['password' => 'old-password']);

    $this->actingAs($user)
        ->putJson('/api/v1/user/password', [
            'current_password' => 'old-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])
        ->assertNoContent();

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
});

test('a password change rejects an incorrect current password', function () {
    $user = User::factory()->create(['password' => 'old-password']);

    $this->actingAs($user)
        ->putJson('/api/v1/user/password', [
            'current_password' => 'incorrect-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('current_password');

    expect(Hash::check('old-password', $user->refresh()->password))->toBeTrue();
});

test('profile endpoints require authentication', function () {
    $this->patchJson('/api/v1/user', ['name' => 'Ada', 'email' => 'ada@example.com'])->assertUnauthorized();
    $this->putJson('/api/v1/user/password', [])->assertUnauthorized();
});
