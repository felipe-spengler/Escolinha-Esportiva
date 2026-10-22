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
        
        $criadas = \App\Services\MensalidadeService::garantirMensalidadesTodosAlunosAtivos();

        // Se faltar 15 dias ou menos para o fim do mês, já antecipa as mensalidades do próximo mês
        $now = Carbon::today();
        $proximoMes = $now->copy()->addMonth();
        if ($now->daysInMonth - $now->day <= 15) {
            $criadas += \App\Services\MensalidadeService::garantirMensalidadesTodosAlunosAtivos($proximoMes);
        }

        // Atualiza status de pendentes vencidas (valor > 0)
        \App\Models\Mensalidade::where('status', 'pending')
            ->where('amount', '>', 0)
            ->where('due_date', '<', Carbon::today())
            ->update(['status' => 'overdue']);

        $this->info("Finalizado! Total gerado: {$criadas}");
        return 0;
    }
}
