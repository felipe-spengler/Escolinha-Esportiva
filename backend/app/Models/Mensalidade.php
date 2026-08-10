<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mensalidade extends Model
{
    protected $fillable = [
        'aluno_id',
        'amount',
        'due_date',
        'paid_at',
        'status',
        'pix_code',
    ];

    protected $casts = [
        'due_date' => 'date:Y-m-d',
        'paid_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function aluno()
    {
        return $this->belongsTo(Aluno::class, 'aluno_id');
    }
}
