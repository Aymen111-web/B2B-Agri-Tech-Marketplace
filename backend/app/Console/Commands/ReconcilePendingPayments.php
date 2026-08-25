<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ReconcilePendingPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:reconcile-pending {--minutes=10 : Reconcile payments pending older than X minutes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Poll Chapa API to reconcile payments that are stuck in pending status';

    /**
     * Execute the console command.
     */
    public function handle(PaymentService $paymentService): int
    {
        $minutes = (int) $this->option('minutes');
        $cutoff  = now()->subMinutes($minutes);

        $pendingPayments = Payment::where('status', 'pending')
            ->where('created_at', '<=', $cutoff)
            ->whereNotNull('chapa_tx_ref')
            ->get();

        if ($pendingPayments->isEmpty()) {
            $this->info('No pending payments requiring reconciliation.');
            return Command::SUCCESS;
        }

        $this->info("Found {$pendingPayments->count()} pending payments for reconciliation.");

        $chapaSecret = config('services.chapa.secret_key');

        foreach ($pendingPayments as $payment) {
            try {
                // If secret key is not set (e.g. testing), log and skip network call
                if (empty($chapaSecret)) {
                    Log::warning("Chapa secret key not configured. Skipping reconciliation for tx_ref: {$payment->chapa_tx_ref}");
                    continue;
                }

                $response = Http::withToken($chapaSecret)
                    ->get("https://api.chapa.co/v1/transaction/verify/{$payment->chapa_tx_ref}");

                if ($response->successful()) {
                    $data   = $response->json();
                    $status = strtolower($data['data']['status'] ?? $data['status'] ?? '');

                    if ($status === 'success') {
                        $paymentService->confirmPayment($payment, $data['data'] ?? $data);
                        $this->info("Payment {$payment->chapa_tx_ref} confirmed successfully via reconciliation.");
                    } elseif (in_array($status, ['failed', 'declined', 'expired'])) {
                        $payment->update([
                            'status'           => 'failed',
                            'gateway_metadata' => $data['data'] ?? $data,
                        ]);
                        $this->info("Payment {$payment->chapa_tx_ref} marked as failed.");
                    }
                }
            } catch (\Exception $e) {
                Log::error("Error reconciling payment {$payment->chapa_tx_ref}: " . $e->getMessage());
                $this->error("Failed to reconcile payment {$payment->chapa_tx_ref}");
            }
        }

        return Command::SUCCESS;
    }
}
