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
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('active'); // active, finished
            $table->timestamps();
        });

        Schema::create('equipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campeonato_id')->constrained('campeonatos')->onDelete('cascade');
            $table->string('name');
            $table->string('coach_name')->nullable();
            $table->timestamps();
        });

        Schema::create('campeonato_jogadores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipe_id')->constrained('equipes')->onDelete('cascade');
            $table->boolean('is_aluno')->default(true);
            $table->foreignId('aluno_id')->nullable()->constrained('alunos')->onDelete('cascade');
            $table->string('name')->nullable(); // For external players
            $table->integer('number');
            $table->timestamps();
        });

        Schema::create('jogos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campeonato_id')->constrained('campeonatos')->onDelete('cascade');
            $table->foreignId('equipe_casa_id')->constrained('equipes')->onDelete('cascade');
            $table->foreignId('equipe_visitante_id')->constrained('equipes')->onDelete('cascade');
            $table->date('date');
            $table->time('time')->nullable();
            $table->integer('gols_casa')->default(0);
            $table->integer('gols_visitante')->default(0);
            $table->string('status')->default('scheduled'); // scheduled, in_progress, finished
            $table->timestamps();
        });

        Schema::create('eventos_jogo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jogo_id')->constrained('jogos')->onDelete('cascade');
            $table->foreignId('jogador_id')->nullable()->constrained('campeonato_jogadores')->onDelete('cascade');
            $table->integer('minute');
            $table->string('type'); // goal, yellow_card, red_card, sub_in, sub_out, other
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eventos_jogo');
        Schema::dropIfExists('jogos');
        Schema::dropIfExists('campeonato_jogadores');
        Schema::dropIfExists('equipes');
        Schema::dropIfExists('campeonatos');
    }
};
