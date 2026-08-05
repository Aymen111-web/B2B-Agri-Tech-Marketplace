<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
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
        $category = $this->route('category');
        $categoryId = $category?->id;

        return [
            'name' => [
                $this->isMethod('put') || $this->isMethod('patch') ? 'sometimes' : 'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->ignore($categoryId),
            ],
            'slug' => [
                $this->isMethod('put') || $this->isMethod('patch') ? 'sometimes' : 'required',
                'string',
                'max:255',
                Rule::unique('categories', 'slug')->ignore($categoryId),
            ],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
