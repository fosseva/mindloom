<?php

namespace App\Http\Requests;

use App\Enums\CardType;
use App\Models\Card;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', [Card::class, $this->route('deck')]) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(CardType::class)], 'sort_order' => ['sometimes', 'integer', 'min:0'],
            'question' => [Rule::requiredIf($this->isType(CardType::Remember) || $this->isType(CardType::Apply)), 'string'],
            'answer' => [Rule::requiredIf($this->isType(CardType::Remember)), 'string'], 'hint' => ['nullable', 'string'], 'notes' => ['nullable', 'string'],
            'prompt' => [Rule::requiredIf($this->isType(CardType::Explain)), 'string'], 'explanation' => [Rule::requiredIf($this->isType(CardType::Explain)), 'string'], 'key_points' => ['nullable', 'string'], 'example' => ['nullable', 'string'],
            'scenario' => [Rule::requiredIf($this->isType(CardType::Apply)), 'string'], 'solution' => [Rule::requiredIf($this->isType(CardType::Apply)), 'string'], 'key_takeaway' => ['nullable', 'string'],
            'title' => ['nullable', 'string', 'max:255'], 'content' => [Rule::requiredIf($this->isType(CardType::Note)), 'string'], 'author' => ['nullable', 'string', 'max:255'], 'source' => ['nullable', 'string', 'max:255'],
        ];
    }

    private function isType(CardType $type): bool
    {
        return $this->input('type') === $type->value;
    }
}
