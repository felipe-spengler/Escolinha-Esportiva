<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campeonato extends Model
{
    protected $fillable = [
        'nome',
        'data_inicio',
        'data_fim',
        'status',
    ];

    public function equipes()
    {
        return $this->hasMany(Equipe::class, 'campeonato_id');
    }

    public function jogos()
    {
        return $this->hasMany(Jogo::class, 'campeonato_id');
    }
}
