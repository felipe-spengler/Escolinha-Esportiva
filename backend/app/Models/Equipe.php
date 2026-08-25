<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipe extends Model
{
    protected $fillable = [
        'campeonato_id',
        'nome',
        'categoria',
    ];

    public function campeonato()
    {
        return $this->belongsTo(Campeonato::class, 'campeonato_id');
    }

    public function inscricoes()
    {
        return $this->hasMany(Inscricao::class, 'equipe_id');
    }
}
