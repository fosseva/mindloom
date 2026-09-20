<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ViewCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('view', $this->route('card')) ?? false;
    }

    public function rules(): array
    {
        return [];
    }
}
