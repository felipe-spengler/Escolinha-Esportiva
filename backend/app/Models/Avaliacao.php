<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Avaliacao extends Model
{
    protected $table = 'avaliacoes';

    protected $fillable = [
        'aluno_id',
        'professor_id',
        'passe',
        'chute',
        'dominio',
        'condicionamento',
        'disciplina',
        'parecer',
        'date',
    ];

    protected $casts = [
        'passe' => 'integer',
        'chute' => 'integer',
        'dominio' => 'integer',
        'condicionamento' => 'integer',
        'disciplina' => 'integer',
        'date' => 'date:Y-m-d',
    ];

    public function aluno()
    {
        return $this->belongsTo(Aluno::class, 'aluno_id');
    }

    public function professor()
    {
        return $this->belongsTo(User::class, 'professor_id');
    }
}
