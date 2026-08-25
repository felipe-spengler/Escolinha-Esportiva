<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campeonatos', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->date('data_inicio')->nullable();
            $table->date('data_fim')->nullable();
            $table->enum('status', ['aberto', 'em_andamento', 'finalizado'])->default('aberto');
            $table->timestamps();
        });

        Schema::create('equipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campeonato_id')->constrained('campeonatos')->onDelete('cascade');
            $table->string('nome');
            $table->string('categoria')->nullable();
            $table->timestamps();
        });

        Schema::create('inscricoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipe_id')->constrained('equipes')->onDelete('cascade');
            $table->foreignId('aluno_id')->nullable()->constrained('alunos')->onDelete('cascade');
            $table->string('nome_externo')->nullable();
            $table->timestamps();
        });

        Schema::create('jogos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campeonato_id')->constrained('campeonatos')->onDelete('cascade');
            $table->foreignId('equipe_casa_id')->constrained('equipes')->onDelete('cascade');
            $table->foreignId('equipe_visitante_id')->constrained('equipes')->onDelete('cascade');
            $table->integer('placar_casa')->nullable();
            $table->integer('placar_visitante')->nullable();
            $table->dateTime('data_hora');
            $table->string('local')->nullable();
            $table->enum('status', ['agendado', 'em_andamento', 'finalizado'])->default('agendado');
            $table->timestamps();
        });

        Schema::create('estatisticas_jogadores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jogo_id')->constrained('jogos')->onDelete('cascade');
            $table->foreignId('aluno_id')->nullable()->constrained('alunos')->onDelete('cascade');
            $table->string('nome_externo')->nullable();
            $table->boolean('participou')->default(true);
            $table->integer('gols_feitos')->default(0);
            $table->integer('gols_sofridos')->default(0);
            $table->boolean('craque_do_jogo')->default(false);
            $table->timestamps();
        });

        Schema::create('eventos', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->enum('tipo', ['treino', 'amistoso', 'torneio', 'outro']);
            $table->text('descricao')->nullable();
            $table->dateTime('data_hora_inicio');
            $table->dateTime('data_hora_fim')->nullable();
            $table->string('local')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eventos');
        Schema::dropIfExists('estatisticas_jogadores');
        Schema::dropIfExists('jogos');
        Schema::dropIfExists('inscricoes');
        Schema::dropIfExists('equipes');
        Schema::dropIfExists('campeonatos');
    }
};
