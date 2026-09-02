<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Responsavel extends Authenticatable
{
    use Notifiable;

    protected $table = 'responsaveis';

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'cpf',
        'asaas_customer_id',
        'api_token',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'password' => 'hashed',
    ];

    public function alunos()
    {
        return $this->hasMany(Aluno::class, 'responsavel_id');
    }
}
