<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderFulfillment extends Model
{
    protected $fillable = [
        'order_id',
        'farmer_id',
        'status',
        'delivery_status',
        'inspection_status',
        'payout_status',
        'subtotal_amount',
        'accepted_quantity',
        'rejected_quantity',
        'inspection_notes',
        'farmer_notes',
        'accepted_at',
        'rejected_at',
        'inspected_at',
        'completed_at',
    ];

    protected $casts = [
        'subtotal_amount'   => 'decimal:2',
        'accepted_quantity' => 'decimal:3',
        'rejected_quantity' => 'decimal:3',
        'accepted_at'       => 'datetime',
        'rejected_at'       => 'datetime',
        'inspected_at'      => 'datetime',
        'completed_at'      => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function farmer()
    {
        return $this->belongsTo(User::class, 'farmer_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payout()
    {
        return $this->hasOne(Payout::class);
    }
}
