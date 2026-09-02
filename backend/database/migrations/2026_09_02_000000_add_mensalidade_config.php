<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alunos', function (Blueprint $table) {
            $table->decimal('mensalidade_valor', 10, 2)->default(120.00)->after('status');
            $table->integer('dia_vencimento')->default(10)->after('mensalidade_valor');
        });
    }

    public function down(): void
    {
        Schema::table('alunos', function (Blueprint $table) {
            $table->dropColumn(['mensalidade_valor', 'dia_vencimento']);
        });
    }
};
