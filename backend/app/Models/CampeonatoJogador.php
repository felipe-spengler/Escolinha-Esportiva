<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampeonatoJogador extends Model
{
    use HasFactory;
    
    protected $table = 'campeonato_jogadores';

    protected $fillable = [
        'equipe_id',
        'is_aluno',
        'aluno_id',
        'name',
        'number',
    ];

    public function equipe()
    {
        return $this->belongsTo(Equipe::class);
    }

    public function aluno()
    {
        return $this->belongsTo(Aluno::class);
    }
}
