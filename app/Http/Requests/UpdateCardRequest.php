<?php

namespace App\Http\Requests;

use App\Enums\CardTypeName;
use App\Models\Card;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('card')) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $card = $this->route('card');

        if (! $card instanceof Card) {
            return [];
        }

        return match ($card->type->name) {
            CardTypeName::Remember => [
                'sort_order' => ['sometimes', 'integer', 'min:0'],
                'archived_at' => ['sometimes', 'nullable', 'date'],
                'question' => ['sometimes', 'required', 'string'],
                'answer' => ['sometimes', 'required', 'string'],
                'hint' => ['sometimes', 'nullable', 'string'],
                'notes' => ['sometimes', 'nullable', 'string'],
            ],
            CardTypeName::Explain => [
                'sort_order' => ['sometimes', 'integer', 'min:0'],
                'archived_at' => ['sometimes', 'nullable', 'date'],
                'prompt' => ['sometimes', 'required', 'string'],
                'explanation' => ['sometimes', 'required', 'string'],
                'key_points' => ['sometimes', 'nullable', 'string'],
                'example' => ['sometimes', 'nullable', 'string'],
            ],
            CardTypeName::Apply => [
                'sort_order' => ['sometimes', 'integer', 'min:0'],
                'archived_at' => ['sometimes', 'nullable', 'date'],
                'scenario' => ['sometimes', 'required', 'string'],
                'question' => ['sometimes', 'required', 'string'],
                'solution' => ['sometimes', 'required', 'string'],
                'key_takeaway' => ['sometimes', 'nullable', 'string'],
            ],
            CardTypeName::Note => [
                'sort_order' => ['sometimes', 'integer', 'min:0'],
                'archived_at' => ['sometimes', 'nullable', 'date'],
                'title' => ['sometimes', 'nullable', 'string'],
                'content' => ['sometimes', 'required', 'string'],
                'author' => ['sometimes', 'nullable', 'string'],
                'source' => ['sometimes', 'nullable', 'string'],
            ],
        };
    }
}
