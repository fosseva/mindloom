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
        $cardType = CardType::query()->find($this->integer('type_id'))?->name;

        return match ($cardType) {
            CardTypeName::Remember => [
                'type_id' => ['required', 'integer', Rule::exists(CardType::class, 'id')],
                'sort_order' => ['sometimes', 'integer', 'min:0'],
                'question' => ['required', 'string'],
                'answer' => ['required', 'string'],
                'hint' => ['nullable', 'string'],
                'notes' => ['nullable', 'string'],
            ],
            CardTypeName::Explain => [
                'type_id' => ['required', 'integer', Rule::exists(CardType::class, 'id')],
                'sort_order' => ['sometimes', 'integer', 'min:0'],
                'prompt' => ['required', 'string'],
                'explanation' => ['required', 'string'],
                'key_points' => ['nullable', 'string'],
                'example' => ['nullable', 'string'],
            ],
            CardTypeName::Apply => [
                'type_id' => ['required', 'integer', Rule::exists(CardType::class, 'id')],
                'sort_order' => ['sometimes', 'integer', 'min:0'],
                'scenario' => ['required', 'string'],
                'question' => ['required', 'string'],
                'solution' => ['required', 'string'],
                'key_takeaway' => ['nullable', 'string'],
            ],
            CardTypeName::Note => [
                'type_id' => ['required', 'integer', Rule::exists(CardType::class, 'id')],
                'sort_order' => ['sometimes', 'integer', 'min:0'],
                'title' => ['nullable', 'string', 'max:255'],
                'content' => ['required', 'string'],
                'author' => ['nullable', 'string', 'max:255'],
                'source' => ['nullable', 'string', 'max:255'],
            ],
            default => [
                'type_id' => ['required', 'integer', Rule::exists(CardType::class, 'id')],
                'sort_order' => ['sometimes', 'integer', 'min:0'],
            ],
        };
    }
}
