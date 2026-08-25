<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Stock Reservation Duration
    |--------------------------------------------------------------------------
    |
    | The duration (in minutes) for which stock remains reserved for an unpaid
    | order. After this time, the order status changes to 'expired' and the
    | reserved stock is automatically returned to available inventory.
    |
    */
    'reservation_duration_minutes' => (int) env('RESERVATION_DURATION_MINUTES', 15),

    /*
    |--------------------------------------------------------------------------
    | Delivery Confirmation PIN Length
    |--------------------------------------------------------------------------
    |
    | Length of the random numeric delivery handoff PIN generated for orders.
    |
    */
    'delivery_pin_length' => 6,
];
