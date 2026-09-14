<?php

namespace Database\Seeders;

use App\Enums\CardTypeName;
use App\Enums\RecallQuality;
use App\Models\CardType;
use Illuminate\Database\Seeder;

class CardTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $definitions = [
            CardTypeName::Remember->value => ['description' => 'Recall a fact, definition, or detail with one clear answer.', 'ratings' => [
                ['name' => 'Missed', 'description' => 'I could not recall it.', 'recall_quality' => RecallQuality::Forgot],
                ['name' => 'Struggled', 'description' => 'I recalled it with significant difficulty.', 'recall_quality' => RecallQuality::Difficult],
                ['name' => 'Got it', 'description' => 'I recalled it correctly.', 'recall_quality' => RecallQuality::Remembered],
                ['name' => 'Instantly', 'description' => 'I recalled it immediately and confidently.', 'recall_quality' => RecallQuality::Easy],
            ]],
            CardTypeName::Explain->value => ['description' => 'Explain an idea clearly in your own words.', 'ratings' => [
                ['name' => "Couldn't explain", 'description' => 'I could not explain the idea.', 'recall_quality' => RecallQuality::Forgot],
                ['name' => 'Partially', 'description' => 'My explanation was incomplete.', 'recall_quality' => RecallQuality::Difficult],
                ['name' => 'Clearly', 'description' => 'I explained the important points.', 'recall_quality' => RecallQuality::Remembered],
                ['name' => 'Confidently', 'description' => 'I explained it clearly without hesitation.', 'recall_quality' => RecallQuality::Easy],
            ]],
            CardTypeName::Apply->value => ['description' => 'Practice making a decision or applying knowledge to a situation.', 'ratings' => [
                ['name' => 'Missed it', 'description' => 'I could not apply the idea.', 'recall_quality' => RecallQuality::Forgot],
                ['name' => 'Needed guidance', 'description' => 'I needed help to apply it.', 'recall_quality' => RecallQuality::Difficult],
                ['name' => 'Applied it', 'description' => 'I applied the idea successfully.', 'recall_quality' => RecallQuality::Remembered],
                ['name' => 'Solved confidently', 'description' => 'I applied it confidently and efficiently.', 'recall_quality' => RecallQuality::Easy],
            ]],
            CardTypeName::Note->value => ['description' => 'Revisit a quote, reflection, or piece of reference material.', 'ratings' => [
                ['name' => 'Revisit', 'description' => 'I want to see this note again soon.', 'recall_quality' => RecallQuality::Forgot],
                ['name' => 'Internalized', 'description' => 'This note feels familiar and well understood.', 'recall_quality' => RecallQuality::Easy],
            ]],
        ];

        foreach ($definitions as $name => $definition) {
            $cardType = CardType::query()->updateOrCreate(['name' => $name], ['description' => $definition['description']]);

            foreach ($definition['ratings'] as $rating) {
                $cardType->ratings()->updateOrCreate(['name' => $rating['name']], ['description' => $rating['description'], 'recall_quality' => $rating['recall_quality']]);
            }
        }
    }
}
