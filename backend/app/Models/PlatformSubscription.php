<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformSubscription extends Model
{
    protected $fillable = [
        'user_id',
        'plan_name',
        'billing_cycle',
        'status',
        'price_etb',
        'starts_at',
        'expires_at',
        'chapa_tx_ref',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'price_etb' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
