<?php

namespace App\Services;

use App\Models\Aluno;
use App\Models\Mensalidade;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class MensalidadeService
{
    /**
     * Garante que o aluno ativo tenha mensalidade gerada para o mês/ano de referência.
     * Respeita o dia de vencimento e o valor cadastrado na ficha do aluno.
     * Se o valor for 0, marca automaticamente como 'paid' (isento/em dia).
     */
    public static function garantirMensalidadeAluno(Aluno $aluno, ?Carbon $targetDate = null): ?Mensalidade
    {
        if ($aluno->status !== 'active') {
            return null;
        }

        $date = $targetDate ? $targetDate->copy() : Carbon::today();
        $currentYear = $date->year;
        $currentMonth = $date->month;

        // Verifica se já existe mensalidade para este aluno no mês e ano indicados
        $exists = Mensalidade::where('aluno_id', $aluno->id)
            ->whereMonth('due_date', $currentMonth)
            ->whereYear('due_date', $currentYear)
            ->first();

        if ($exists) {
            return $exists;
        }

        $dueDay = $aluno->dia_vencimento ?: 10;
        $lastDayOfMonth = $date->daysInMonth;
        $actualDueDay = min($dueDay, $lastDayOfMonth);

        $dueDateStr = sprintf('%04d-%02d-%02d', $currentYear, $currentMonth, $actualDueDay);
        $dueDateObj = Carbon::parse($dueDateStr);

        $amount = $aluno->mensalidade_valor !== null ? (float) $aluno->mensalidade_valor : 120.00;

        // Se o valor for 0, o aluno tem bolsa/isenção e a mensalidade é marcada como paga (em dia)
        if ($amount <= 0) {
            $status = 'paid';
            $paidAt = Carbon::now();
        } else {
            $status = $dueDateObj->isPast() ? 'overdue' : 'pending';
            $paidAt = null;
        }

        try {
            $mensalidade = Mensalidade::create([
                'aluno_id' => $aluno->id,
                'amount' => $amount,
                'due_date' => $dueDateStr,
                'status' => $status,
                'paid_at' => $paidAt,
            ]);

            $settings = Setting::first();
            if ($settings && $settings->payment_method !== 'manual' && $amount > 0 && $aluno->responsavel) {
                try {
                    $asaasService = new AsaasService();
                    $juros = (float) ($settings->juros_mensal ?? 1.00);
                    $multa = (float) ($settings->multa_atraso ?? 2.00);

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
                } catch (\Throwable $e) {
                    Log::error("Erro Asaas Mensalidade ID {$mensalidade->id}: " . $e->getMessage());
                }
            }

            return $mensalidade;
        } catch (\Throwable $e) {
            Log::error("Erro ao gerar mensalidade para aluno {$aluno->id}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Garante a geração de mensalidades para todos os alunos ativos no mês/ano indicado.
     */
    public static function garantirMensalidadesTodosAlunosAtivos(?Carbon $targetDate = null): int
    {
        $alunos = Aluno::where('status', 'active')->whereNotNull('responsavel_id')->get();
        $criadas = 0;

        foreach ($alunos as $aluno) {
            $date = $targetDate ? $targetDate->copy() : Carbon::today();
            $exists = Mensalidade::where('aluno_id', $aluno->id)
                ->whereMonth('due_date', $date->month)
                ->whereYear('due_date', $date->year)
                ->exists();

            if (!$exists) {
                $mensalidade = self::garantirMensalidadeAluno($aluno, $targetDate);
                if ($mensalidade) {
                    $criadas++;
                }
            }
        }

        return $criadas;
    }
}
