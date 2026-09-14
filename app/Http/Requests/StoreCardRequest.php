<?php

namespace App\Http\Requests;

use App\Enums\CardTypeName;
use App\Models\Card;
use App\Models\CardType;
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
            'type_id' => ['required', 'integer', Rule::exists(CardType::class, 'id')], 'sort_order' => ['sometimes', 'integer', 'min:0'],
            'question' => [Rule::requiredIf($this->isType(CardTypeName::Remember) || $this->isType(CardTypeName::Apply)), 'string'],
            'answer' => [Rule::requiredIf($this->isType(CardTypeName::Remember)), 'string'], 'hint' => ['nullable', 'string'], 'notes' => ['nullable', 'string'],
            'prompt' => [Rule::requiredIf($this->isType(CardTypeName::Explain)), 'string'], 'explanation' => [Rule::requiredIf($this->isType(CardTypeName::Explain)), 'string'], 'key_points' => ['nullable', 'string'], 'example' => ['nullable', 'string'],
            'scenario' => [Rule::requiredIf($this->isType(CardTypeName::Apply)), 'string'], 'solution' => [Rule::requiredIf($this->isType(CardTypeName::Apply)), 'string'], 'key_takeaway' => ['nullable', 'string'],
            'title' => ['nullable', 'string', 'max:255'], 'content' => [Rule::requiredIf($this->isType(CardTypeName::Note)), 'string'], 'author' => ['nullable', 'string', 'max:255'], 'source' => ['nullable', 'string', 'max:255'],
        ];
    }

    private function isType(CardTypeName $type): bool
    {
        return CardType::find($this->integer('type_id'))?->name === $type;
    }
}
