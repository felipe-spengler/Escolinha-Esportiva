<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Turma extends Model
{
    protected $fillable = [
        'professor_id',
        'name',
        'schedule',
    ];

    public function professor()
    {
        return $this->belongsTo(User::class, 'professor_id');
    }

    public function alunos()
    {
        return $this->belongsToMany(Aluno::class, 'matriculas', 'turma_id', 'aluno_id');
    }
}
