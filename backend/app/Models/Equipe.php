<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipe extends Model
{
    use HasFactory;

    protected $fillable = [
        'campeonato_id',
        'name',
        'coach_name',
    ];

    public function campeonato()
    {
        return $this->belongsTo(Campeonato::class);
    }

    public function jogadores()
    {
        return $this->hasMany(CampeonatoJogador::class);
    }
}
