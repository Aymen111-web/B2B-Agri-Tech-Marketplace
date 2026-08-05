<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CapabilityApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'capability_type' => ['required', 'in:farmer,buyer'],
            'supporting_documents' => ['nullable', 'array'],
            'rejection_reason' => ['sometimes', 'required', 'string', 'max:500'],
        ];
    }
}
