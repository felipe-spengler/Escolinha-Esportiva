<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aluno extends Model
{
    protected $fillable = [
        'responsavel_id',
        'name',
        'birth_date',
        'status',
        'medical_notes',
        'photo_path',
    ];

    public function responsavel()
    {
        return $this->belongsTo(Responsavel::class, 'responsavel_id');
    }

    public function turmas()
    {
        return $this->belongsToMany(Turma::class, 'matriculas', 'aluno_id', 'turma_id');
    }

    public function frequencias()
    {
        return $this->hasMany(Frequencia::class, 'aluno_id');
    }

    public function mensalidades()
    {
        return $this->hasMany(Mensalidade::class, 'aluno_id');
    }

    public function avaliacoes()
    {
        return $this->hasMany(Avaliacao::class, 'aluno_id');
    }
}
