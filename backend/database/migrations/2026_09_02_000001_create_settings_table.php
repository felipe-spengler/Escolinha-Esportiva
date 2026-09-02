<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('juros_mensal', 5, 2)->default(1.00); // 1%
            $table->decimal('multa_atraso', 5, 2)->default(2.00); // 2%
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
