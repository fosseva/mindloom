import type { CardType } from '../../types';

export const cardTypeLabels: Record<CardType, string> = {
    remember: 'Remember',
    explain: 'Explain',
    apply: 'Apply',
    note: 'Note',
};

export const cardFields: Record<
    CardType,
    { key: string; label: string; required?: boolean; hint: string; placeholder: string }[]
> = {
    remember: [
        {
            key: 'question',
            label: 'Question',
            required: true,
            hint: 'The question you want to be able to answer from memory.',
            placeholder: 'e.g. What is the capital of France?',
        },
        {
            key: 'answer',
            label: 'Answer',
            required: true,
            hint: 'The correct answer, shown after you try to recall it.',
            placeholder: 'e.g. Paris',
        },
        {
            key: 'hint',
            label: 'Hint',
            hint: 'An optional clue shown if you get stuck, before the answer appears.',
            placeholder: "e.g. It's known as the City of Light.",
        },
        {
            key: 'notes',
            label: 'Notes',
            hint: 'Any extra detail worth remembering along with the answer.',
            placeholder: 'e.g. It has been the capital of France since the 12th century.',
        },
    ],
    explain: [
        {
            key: 'prompt',
            label: 'Topic to explain',
            required: true,
            hint: 'The idea you want to practice explaining in your own words.',
            placeholder: 'e.g. Explain how rainbows form.',
        },
        {
            key: 'explanation',
            label: 'Model explanation',
            required: true,
            hint: 'A clear explanation you would expect from someone who understands this well.',
            placeholder:
                'e.g. Rainbows appear when sunlight passes through water droplets in the air, bending and splitting into different colors.',
        },
        {
            key: 'key_points',
            label: 'Key points to cover',
            hint: 'The main points a good explanation should mention.',
            placeholder: 'e.g. Sunlight, water droplets, bending light, colors',
        },
        {
            key: 'example',
            label: 'Example',
            hint: 'A simple, everyday example that helps make the idea concrete.',
            placeholder: 'e.g. Seeing a rainbow after it rains on a sunny afternoon.',
        },
    ],
    apply: [
        {
            key: 'scenario',
            label: 'Scenario',
            required: true,
            hint: 'A short, everyday situation to set the scene for the question.',
            placeholder:
                "e.g. You're halfway through a recipe and realize you're out of an ingredient.",
        },
        {
            key: 'question',
            label: 'What should they do?',
            required: true,
            hint: 'The decision or action you want the learner to work out.',
            placeholder: 'e.g. What would you do to finish making the meal?',
        },
        {
            key: 'solution',
            label: 'Suggested approach',
            required: true,
            hint: "A sensible way to handle it, used to check the learner's own answer.",
            placeholder:
                'e.g. Look for a common substitute, or adjust the recipe to work without it.',
        },
        {
            key: 'key_takeaway',
            label: 'Key takeaway',
            hint: 'The one lesson worth remembering from this scenario.',
            placeholder:
                'e.g. Most recipes are flexible, and small substitutions rarely ruin a dish.',
        },
    ],
    note: [
        {
            key: 'title',
            label: 'Title',
            hint: 'A short title so this piece of content is easy to recognize later.',
            placeholder: 'e.g. Notes on eating well',
        },
        {
            key: 'content',
            label: 'Content',
            required: true,
            hint: 'The text you want to revisit and review from time to time.',
            placeholder: 'e.g. Paste a quote, summary, or personal note here.',
        },
        {
            key: 'author',
            label: 'Author',
            hint: 'Who said or wrote this, if relevant.',
            placeholder: 'e.g. Maya Angelou',
        },
        {
            key: 'source',
            label: 'Source',
            hint: 'Where this content comes from.',
            placeholder: 'e.g. Book title, URL, or publication',
        },
    ],
};
