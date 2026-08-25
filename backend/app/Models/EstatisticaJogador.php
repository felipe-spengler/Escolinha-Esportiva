<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstatisticaJogador extends Model
{
    protected $table = 'estatisticas_jogadores';

    protected $fillable = [
        'jogo_id',
        'aluno_id',
        'nome_externo',
        'participou',
        'gols_feitos',
        'gols_sofridos',
        'craque_do_jogo',
    ];

    public function jogo()
    {
        return $this->belongsTo(Jogo::class, 'jogo_id');
    }

    public function aluno()
    {
        return $this->belongsTo(Aluno::class, 'aluno_id');
    }
}
