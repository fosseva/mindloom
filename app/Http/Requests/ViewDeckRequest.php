<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ViewDeckRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('view', $this->route('deck')) ?? false;
    }

    public function rules(): array
    {
        return [];
    }
}
