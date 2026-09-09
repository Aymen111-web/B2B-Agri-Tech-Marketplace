<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentExceptionRequest extends FormRequest
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
        return [
            'order_id'    => ['required_without:payment_id', 'nullable'],
            'payment_id'  => ['required_without:order_id', 'nullable'],
            'type'        => ['required', 'string', 'in:produce_damaged,quality_mismatch,delivery_delay,wrong_quantity,dispute,mismatch,failed_payment_review,refund_request,other'],
            'description' => ['required', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'type.in'         => 'Claim type must be one of: produce_damaged, quality_mismatch, delivery_delay, wrong_quantity, dispute, other.',
            'description.max' => 'Description must not exceed 2000 characters.',
        ];
    }
}
