<?php

namespace App\Http\Requests;

use App\Models\Rating;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCardReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('review', $this->route('card')) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'rating_id' => ['required', 'integer', Rule::exists(Rating::class, 'id')->where(fn ($query) => $query->where('card_type_id', $this->route('card')->type_id))],
            'reviewed_at' => ['sometimes', 'date'],
            'duration_ms' => ['sometimes', 'nullable', 'integer', 'min:0'],
        ];
    }
}
