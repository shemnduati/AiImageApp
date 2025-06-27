<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'stripe_payment_intent_id',
        'credits_amount',
        'amount_paid',
        'currency',
        'status',
        'paid_at',
    ]
}
