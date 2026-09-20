<?php

namespace Database\Seeders;

use App\Actions\Cards\CreateCardAction;
use App\Actions\Decks\CreateDeckAction;
use App\Enums\CardTypeName;
use App\Models\CardType;
use App\Models\User;
use Illuminate\Database\Seeder;

class LearningDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(User $user): void
    {
        $createDeck = resolve(CreateDeckAction::class);
        $createCard = resolve(CreateCardAction::class);
        $typeIds = CardType::query()->pluck('id', 'name');

        $geography = $createDeck($user, [
            'name' => 'World Geography',
            'description' => 'Everyday facts worth having on hand.',
        ]);
        $science = $createDeck($user, [
            'name' => 'Everyday Science',
            'description' => 'Simple explanations for things you see every day.',
        ]);
        $lifeSkills = $createDeck($user, [
            'name' => 'Life Skills',
            'description' => 'Practical situations worth thinking through.',
        ]);
        $notes = $createDeck($user, [
            'name' => 'Notes Worth Revisiting',
            'description' => 'Quotes and ideas worth coming back to.',
        ]);

        $createCard($user, $geography, [
            'type_id' => $typeIds[CardTypeName::Remember->value],
            'question' => 'What is the capital of France?',
            'answer' => 'Paris',
            'hint' => "It's known as the City of Light.",
            'notes' => 'It has been the capital of France since the 12th century.',
        ]);
        $createCard($user, $geography, [
            'type_id' => $typeIds[CardTypeName::Remember->value],
            'question' => 'What is the capital of Japan?',
            'answer' => 'Tokyo',
        ]);
        $createCard($user, $science, [
            'type_id' => $typeIds[CardTypeName::Explain->value],
            'prompt' => 'Explain how rainbows form.',
            'explanation' => 'Rainbows appear when sunlight passes through water droplets in the air, bending and splitting into different colors.',
            'key_points' => 'Sunlight, water droplets, bending light, colors',
            'example' => 'Seeing a rainbow after it rains on a sunny afternoon.',
        ]);
        $createCard($user, $lifeSkills, [
            'type_id' => $typeIds[CardTypeName::Apply->value],
            'scenario' => "You're halfway through a recipe and realize you're out of an ingredient.",
            'question' => 'What would you do to finish making the meal?',
            'solution' => 'Look for a common substitute, or adjust the recipe to work without it.',
            'key_takeaway' => 'Most recipes are flexible, and small substitutions rarely ruin a dish.',
        ]);
        $createCard($user, $notes, [
            'type_id' => $typeIds[CardTypeName::Note->value],
            'title' => 'A quote worth remembering',
            'content' => 'Simplicity is the ultimate sophistication.',
            'author' => 'Leonardo da Vinci',
        ]);
    }
}
