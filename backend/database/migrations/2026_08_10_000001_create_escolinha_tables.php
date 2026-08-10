<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('responsaveis', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('phone');
            $table->string('cpf')->unique();
            $table->string('api_token', 80)->unique()->nullable();
            $table->timestamps();
        });

        Schema::create('alunos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('responsavel_id')->constrained('responsaveis')->onDelete('cascade');
            $table->string('name');
            $table->date('birth_date');
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->text('medical_notes')->nullable();
            $table->string('photo_path')->nullable();
            $table->timestamps();
        });

        Schema::create('turmas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professor_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->string('schedule');
            $table->timestamps();
        });

        Schema::create('matriculas', function (Blueprint $table) {
            $table->foreignId('aluno_id')->constrained('alunos')->onDelete('cascade');
            $table->foreignId('turma_id')->constrained('turmas')->onDelete('cascade');
            $table->primary(['aluno_id', 'turma_id']);
        });

        Schema::create('frequencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aluno_id')->constrained('alunos')->onDelete('cascade');
            $table->foreignId('turma_id')->constrained('turmas')->onDelete('cascade');
            $table->date('date');
            $table->enum('status', ['present', 'absent']);
            $table->timestamps();
        });

        Schema::create('mensalidades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aluno_id')->constrained('alunos')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->date('due_date');
            $table->timestamp('paid_at')->nullable();
            $table->enum('status', ['pending', 'paid', 'overdue'])->default('pending');
            $table->text('pix_code')->nullable();
            $table->timestamps();
        });

        Schema::create('produtos', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->integer('stock_quantity');
            $table->timestamps();
        });

        Schema::create('vendas_produtos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produto_id')->constrained('produtos')->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('total_amount', 10, 2);
            $table->date('date');
            $table->timestamps();
        });

        Schema::create('fluxo_caixa', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['income', 'expense']);
            $table->enum('origin_type', ['mensalidade', 'venda_produto', 'avulso']);
            $table->unsignedBigInteger('origin_id')->nullable();
            $table->string('description');
            $table->decimal('amount', 10, 2);
            $table->date('date');
            $table->timestamps();
        });

        Schema::create('avaliacoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aluno_id')->constrained('alunos')->onDelete('cascade');
            $table->foreignId('professor_id')->constrained('users')->onDelete('cascade');
            $table->integer('passe');
            $table->integer('chute');
            $table->integer('dominio');
            $table->integer('condicionamento');
            $table->integer('disciplina');
            $table->text('parecer')->nullable();
            $table->date('date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avaliacoes');
        Schema::dropIfExists('fluxo_caixa');
        Schema::dropIfExists('vendas_produtos');
        Schema::dropIfExists('produtos');
        Schema::dropIfExists('mensalidades');
        Schema::dropIfExists('frequencias');
        Schema::dropIfExists('matriculas');
        Schema::dropIfExists('turmas');
        Schema::dropIfExists('alunos');
        Schema::dropIfExists('responsaveis');
    }
};
