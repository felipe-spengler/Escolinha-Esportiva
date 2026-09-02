<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campeonato extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'status',
    ];

    public function equipes()
    {
        return $this->hasMany(Equipe::class);
    }

    public function jogos()
    {
        return $this->hasMany(Jogo::class);
    }
}
