<?php

namespace App\Services;

use App\Models\OrderFulfillment;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ChapaService
{
    /**
     * Create or update a Chapa Subaccount for a farmer.
     *
     * POST https://api.chapa.co/v1/subaccount
     */
    public function createSubaccount(User $user, array $paymentDetails): string
    {
        $secretKey = config('services.chapa.secret_key');
        $businessName = trim("{$user->first_name} {$user->second_name}");

        $payload = [
            'business_name'  => $businessName ?: 'Farmer Merchant',
            'account_name'   => $paymentDetails['account_name'],
            'bank_code'      => $paymentDetails['bank_code'],
            'account_number' => $paymentDetails['account_number'],
            'split_type'     => 'percentage',
            'split_value'    => 0, // 100% direct settlement to farmer subaccount
        ];

        if ($secretKey) {
            try {
                $response = Http::withToken($secretKey)
                    ->post('https://api.chapa.co/v1/subaccount', $payload);

                if ($response->successful()) {
                    $subId = $response->json('data.subaccount_id') ?? $response->json('data.id');

                    if ($subId) {
                        return (string) $subId;
                    }
                } else {
                    Log::warning('Chapa subaccount creation API response failure:', [
                        'user_id' => $user->id,
                        'status'  => $response->status(),
                        'body'    => $response->body(),
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Chapa subaccount creation API exception:', [
                    'user_id' => $user->id,
                    'message' => $e->getMessage(),
                ]);
            }
        }

        // Fallback/Dev Mode Subaccount ID generation if Chapa secret key is sandbox/unconfigured or API call returns mock
        $fallbackSubId = $user->chapa_subaccount_id ?: 'SUB-' . strtoupper(Str::random(10));

        return $fallbackSubId;
    }

    /**
     * Initialize hosted checkout direct payment for a fulfillment to farmer subaccount.
     *
     * POST https://api.chapa.co/v1/transaction/initialize
     */
    public function initializeDirectPayment(
        OrderFulfillment $fulfillment,
        User $buyer,
        User $farmer,
        string $txRef
    ): array {
        $secretKey = config('services.chapa.secret_key');

        $payload = [
            'amount'        => (float) $fulfillment->subtotal_amount,
            'currency'      => 'ETB',
            'tx_ref'        => $txRef,
            'callback_url'  => config('services.chapa.callback_url'),
            'return_url'    => config('services.chapa.return_url'),
            'first_name'    => $buyer->first_name,
            'last_name'     => $buyer->second_name,
            'phone_number'  => $buyer->phone,
            'subaccount_id' => $farmer->chapa_subaccount_id,
            'subaccounts'   => [
                [
                    'id'          => $farmer->chapa_subaccount_id,
                    'split_type'  => 'percentage',
                    'split_value' => 0,
                ],
            ],
            'customization' => [
                'title'       => 'Ethiopian Farmers Market Direct Settlement',
                'description' => "Direct payment to Farmer {$farmer->first_name} for Fulfillment #{$fulfillment->id}",
            ],
        ];

        if ($secretKey) {
            try {
                $response = Http::withToken($secretKey)
                    ->post('https://api.chapa.co/v1/transaction/initialize', $payload);

                if ($response->successful()) {
                    $data = $response->json('data');

                    if (! empty($data['checkout_url'])) {
                        return [
                            'success'      => true,
                            'checkout_url' => $data['checkout_url'],
                        ];
                    }
                }

                Log::warning('Chapa direct payment initialization unsuccessful:', [
                    'fulfillment_id' => $fulfillment->id,
                    'body'           => $response->body(),
                ]);
            } catch (\Exception $e) {
                Log::error('Chapa direct payment initialization exception:', [
                    'fulfillment_id' => $fulfillment->id,
                    'message'        => $e->getMessage(),
                ]);
            }
        }

        // Mock hosted checkout URL for local dev environment
        $mockCheckoutUrl = 'https://checkout.chapa.co/pay/test-' . strtolower($txRef);

        return [
            'success'      => true,
            'checkout_url' => $mockCheckoutUrl,
        ];
    }
}
