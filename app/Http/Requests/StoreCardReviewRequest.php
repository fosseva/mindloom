<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCardReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('review', $this->route('card')) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['rating' => ['required', 'integer', 'between:1,4'], 'reviewed_at' => ['sometimes', 'date'], 'duration_ms' => ['sometimes', 'nullable', 'integer', 'min:0']];
    }
}
