<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'first_name'  => ['sometimes', 'string', 'max:255'],
            'second_name' => ['sometimes', 'string', 'max:255'],
            'phone'       => ['sometimes', 'string', 'unique:users,phone,' . $userId],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'first_name.max'  => 'First name must not exceed 255 characters.',
            'second_name.max' => 'Second name must not exceed 255 characters.',
            'phone.unique'    => 'This phone number is already registered.',
        ];
    }
}
