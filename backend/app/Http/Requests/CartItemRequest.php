<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CartItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        if ($this->isMethod('put') || $this->isMethod('patch')) {
            return [
                'quantity' => ['required', 'numeric', 'min:0.001'],
            ];
        }

        return [
            'listing_id' => ['required', 'exists:listings,id'],
            'quantity' => ['required', 'numeric', 'min:0.001'],
        ];
    }
}
