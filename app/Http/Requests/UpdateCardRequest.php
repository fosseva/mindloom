<?php

namespace App\Http\Requests;

use App\Enums\CardTypeName;
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
        foreach ($this->route('card')->type->name->fields() as $field) {
            $rules[$field] = ['sometimes', 'nullable', 'string'];
        }
        foreach ($this->requiredFields($this->route('card')->type->name) as $field) {
            $rules[$field] = ['sometimes', 'required', 'string'];
        }

        return $rules;
    }

    /** @return list<string> */
    private function requiredFields(CardTypeName $type): array
    {
        return match ($type) {
            CardTypeName::Remember => ['question', 'answer'], CardTypeName::Explain => ['prompt', 'explanation'], CardTypeName::Apply => ['scenario', 'question', 'solution'], CardTypeName::Note => ['content']
        };
    }
}
