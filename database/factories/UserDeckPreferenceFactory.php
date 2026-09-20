<?php

namespace Database\Factories;

use App\Models\Deck;
use App\Models\User;
use App\Models\UserDeckPreference;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserDeckPreference>
 */
class UserDeckPreferenceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return ['user_id' => User::factory(), 'deck_id' => Deck::factory(), 'sort_order' => 0];
    }
}
