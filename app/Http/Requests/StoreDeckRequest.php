<?php

namespace App\Http\Requests;

use App\Models\Deck;
use Illuminate\Foundation\Http\FormRequest;

class StoreDeckRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Deck::class) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['name' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string'], 'sort_order' => ['sometimes', 'integer', 'min:0']];
    }
}
