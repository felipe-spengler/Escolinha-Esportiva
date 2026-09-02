<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventoJogo extends Model
{
    use HasFactory;

    protected $table = 'eventos_jogo';

    protected $fillable = [
        'jogo_id',
        'jogador_id',
        'minute',
        'type',
        'description',
    ];

    public function jogo()
    {
        return $this->belongsTo(Jogo::class);
    }

    public function jogador()
    {
        return $this->belongsTo(CampeonatoJogador::class, 'jogador_id');
    }
}
