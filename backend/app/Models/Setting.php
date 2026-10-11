<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'juros_mensal',
        'multa_atraso',
        'payment_method',
        'pix_key',
        'pix_name',
        'pix_city',
    ];
}
