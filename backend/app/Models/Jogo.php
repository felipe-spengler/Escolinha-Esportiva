<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jogo extends Model
{
    use HasFactory;

    protected $fillable = [
        'campeonato_id',
        'equipe_casa_id',
        'equipe_visitante_id',
        'date',
        'time',
        'gols_casa',
        'gols_visitante',
        'status',
    ];

    public function campeonato()
    {
        return $this->belongsTo(Campeonato::class);
    }

    public function equipeCasa()
    {
        return $this->belongsTo(Equipe::class, 'equipe_casa_id');
    }

    public function equipeVisitante()
    {
        return $this->belongsTo(Equipe::class, 'equipe_visitante_id');
    }

    public function eventos()
    {
        return $this->hasMany(EventoJogo::class);
    }
}
