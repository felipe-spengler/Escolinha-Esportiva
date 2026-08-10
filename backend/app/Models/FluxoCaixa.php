<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FluxoCaixa extends Model
{
    protected $table = 'fluxo_caixa';

    protected $fillable = [
        'type',
        'origin_type',
        'origin_id',
        'description',
        'amount',
        'date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date:Y-m-d',
    ];
}
