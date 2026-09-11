<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\Order;

class FarmerPaymentConfirmed extends Notification
{
    use Queueable;

    public Order $order;
    public float $amount;

    public function __construct(Order $order, float $amount)
    {
        $this->order = $order;
        $this->amount = $amount;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'amount' => $this->amount,
            'message' => 'Payment of ' . number_format($this->amount, 2) . ' Br for order #' . $this->order->order_number . ' has been confirmed. Payout to your registered account is pending.',
        ];
    }
}
