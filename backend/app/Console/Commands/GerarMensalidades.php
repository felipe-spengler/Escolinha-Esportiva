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

        $now = Carbon::today();
        
        // Vamos checar o mês atual e o próximo mês
        $monthsToCheck = [
            $now->copy(),
            $now->copy()->addMonth()
        ];

        foreach ($alunosAtivos as $aluno) {
            if (!$aluno->responsavel) {
                continue;
            }

            $dueDay = $aluno->dia_vencimento ?: 10;
            $amount = $aluno->mensalidade_valor ?: 120.00;

            foreach ($monthsToCheck as $monthDate) {
                $currentYear = $monthDate->year;
                $currentMonth = $monthDate->month;
                
                $lastDayOfMonth = $monthDate->daysInMonth;
                $actualDueDay = $dueDay > $lastDayOfMonth ? $lastDayOfMonth : $dueDay;
                
                $dueDateStr = sprintf('%04d-%02d-%02d', $currentYear, $currentMonth, $actualDueDay);
                $dueDateObj = Carbon::parse($dueDateStr);

                // Gerar se faltar 15 dias ou menos para o vencimento (ou se já passou)
                if ($dueDateObj->lessThanOrEqualTo($now->copy()->addDays(15))) {
                    
                    $exists = Mensalidade::where('aluno_id', $aluno->id)
                        ->whereMonth('due_date', $currentMonth)
                        ->whereYear('due_date', $currentYear)
                        ->exists();

                    if (!$exists) {
                        try {
                            $mensalidade = Mensalidade::create([
                                'aluno_id' => $aluno->id,
                                'amount' => $amount,
                                'due_date' => $dueDateStr,
                                'status' => 'pending',
                            ]);

                            $payment = $asaasService->createPayment(
                                $aluno->responsavel,
                                $amount,
                                "Mensalidade Escolinha - {$currentMonth}/{$currentYear} - Aluno: {$aluno->name}",
                                (string) $mensalidade->id,
                                $dueDateStr,
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
                            $this->info("Mensalidade gerada para {$aluno->name} ({$currentMonth}/{$currentYear})");
                        } catch (\Exception $e) {
                            Log::error("Erro Asaas Mensalidade (Cron) ID {$mensalidade->id}: " . $e->getMessage());
                            $this->error("Erro ao gerar para {$aluno->name}: " . $e->getMessage());
                        }
                    }
                }
            }
        }

        $this->info("Finalizado! Total gerado: {$criadas}");
        return 0;
    }
}
