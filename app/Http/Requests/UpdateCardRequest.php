<?php

namespace App\Http\Requests;

use App\Enums\CardType;
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
        $rules = ['sort_order' => ['sometimes', 'integer', 'min:0'], 'archived_at' => ['sometimes', 'nullable', 'date']];
        foreach ($this->route('card')->type->fields() as $field) {
            $rules[$field] = ['sometimes', 'nullable', 'string'];
        }
        foreach ($this->requiredFields($this->route('card')->type) as $field) {
            $rules[$field] = ['sometimes', 'required', 'string'];
        }

        return $rules;
    }

    /** @return list<string> */
    private function requiredFields(CardType $type): array
    {
        return match ($type) {
            CardType::Remember => ['question', 'answer'], CardType::Explain => ['prompt', 'explanation'], CardType::Apply => ['scenario', 'question', 'solution'], CardType::Note => ['content']
        };
    }
}
