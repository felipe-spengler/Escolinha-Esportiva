<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('responsaveis', function (Blueprint $table) {
            $table->string('asaas_customer_id')->nullable();
        });

        Schema::table('mensalidades', function (Blueprint $table) {
            $table->string('asaas_payment_id')->nullable();
            $table->string('payment_url')->nullable();
            $table->string('invoice_url')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('responsaveis', function (Blueprint $table) {
            $table->dropColumn('asaas_customer_id');
        });

        Schema::table('mensalidades', function (Blueprint $table) {
            $table->dropColumn(['asaas_payment_id', 'payment_url', 'invoice_url']);
        });
    }
};
