<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jogo extends Model
{
    protected $fillable = [
        'campeonato_id',
        'equipe_casa_id',
        'equipe_visitante_id',
        'placar_casa',
        'placar_visitante',
        'data_hora',
        'local',
        'status',
    ];

    protected $casts = [
        'data_hora' => 'datetime',
    ];

    public function campeonato()
    {
        return $this->belongsTo(Campeonato::class, 'campeonato_id');
    }

    public function equipeCasa()
    {
        return $this->belongsTo(Equipe::class, 'equipe_casa_id');
    }

    public function equipeVisitante()
    {
        return $this->belongsTo(Equipe::class, 'equipe_visitante_id');
    }

    public function estatisticas()
    {
        return $this->hasMany(EstatisticaJogador::class, 'jogo_id');
    }
}
