<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Aluno;
use App\Models\Mensalidade;
use App\Models\Setting;
use App\Services\AsaasService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class GerarMensalidades extends Command
{
    protected $signature = 'mensalidades:gerar';
    protected $description = 'Gera as mensalidades do mês atual para todos os alunos ativos';

    public function handle()
    {
        $this->info('Iniciando geração automática de mensalidades...');
        
        $alunosAtivos = Aluno::with('responsavel')->where('status', 'active')->get();
        $settings = Setting::first();
        
        $juros = $settings ? (float) $settings->juros_mensal : 1.00;
        $multa = $settings ? (float) $settings->multa_atraso : 2.00;

        $asaasService = new AsaasService();
        $criadas = 0;

        $currentYear = date('Y');
        $currentMonth = date('m');

        foreach ($alunosAtivos as $aluno) {
            if (!$aluno->responsavel) {
                continue;
            }

            // O vencimento é o dia configurado no aluno, no mês atual
            $dueDay = $aluno->dia_vencimento ?: 10;
            
            // Garantir que o dia existe no mês (ex: dia 31 em fevereiro)
            $lastDayOfMonth = date('t', strtotime("$currentYear-$currentMonth-01"));
            if ($dueDay > $lastDayOfMonth) {
                $dueDay = $lastDayOfMonth;
            }

            $dueDate = sprintf('%04d-%02d-%02d', $currentYear, $currentMonth, $dueDay);
            $amount = $aluno->mensalidade_valor ?: 120.00;

            // Verificar se já existe mensalidade no mês
            $exists = Mensalidade::where('aluno_id', $aluno->id)
                ->whereMonth('due_date', $currentMonth)
                ->whereYear('due_date', $currentYear)
                ->exists();

            if (!$exists) {
                try {
                    $mensalidade = Mensalidade::create([
                        'aluno_id' => $aluno->id,
                        'amount' => $amount,
                        'due_date' => $dueDate,
                        'status' => 'pending',
                    ]);

                    $payment = $asaasService->createPayment(
                        $aluno->responsavel,
                        $amount,
                        "Mensalidade Escolinha - {$currentMonth}/{$currentYear} - Aluno: {$aluno->name}",
                        (string) $mensalidade->id,
                        $dueDate,
                        $juros,
                        $multa
                    );

                    if (isset($payment['id'])) {
                        $mensalidade->update([
                            'asaas_payment_id' => $payment['id'],
                            'payment_url' => $payment['invoiceUrl'] ?? null,
                            'invoice_url' => $payment['bankSlipUrl'] ?? null,
                            'pix_code' => $payment['pix_payload'] ?? null,
                        ]);
                    }

                    $criadas++;
                    $this->info("Mensalidade gerada para {$aluno->name}");
                } catch (\Exception $e) {
                    Log::error("Erro Asaas Mensalidade (Cron) ID {$mensalidade->id}: " . $e->getMessage());
                    $this->error("Erro ao gerar para {$aluno->name}: " . $e->getMessage());
                }
            }
        }

        $this->info("Finalizado! Total gerado: {$criadas}");
        return 0;
    }
}
