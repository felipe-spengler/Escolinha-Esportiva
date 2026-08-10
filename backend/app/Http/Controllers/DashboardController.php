<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Aluno;
use App\Models\Mensalidade;
use App\Models\FluxoCaixa;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        // 1. Total de alunos ativos
        $totalAlunosAtivos = Aluno::where('status', 'active')->count();

        // 2. Inadimplência do mês
        // count em mensalidades onde status = 'overdue' ou pending com vencimento menor que hoje
        $inadimplentes = Mensalidade::where(function ($query) use ($today) {
            $query->where('status', 'overdue')
                  ->orWhere(function ($q) use ($today) {
                      $q->where('status', 'pending')
                        ->where('due_date', '<', $today);
                  });
        })->count();

        // 3. Aniversariantes do mês/dia
        $aniversariantesDia = Aluno::whereMonth('birth_date', $today->month)
                                    ->whereDay('birth_date', $today->day)
                                    ->get(['id', 'name', 'birth_date']);

        $aniversariantesMes = Aluno::whereMonth('birth_date', $today->month)
                                    ->get(['id', 'name', 'birth_date']);

        // 4. Gráfico: Receitas vs. Despesas do mês atual
        $receitasMes = FluxoCaixa::where('type', 'income')
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $despesasMes = FluxoCaixa::where('type', 'expense')
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        // Financial history (last 6 months) for charts
        $fluxoHistorico = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $inc = FluxoCaixa::where('type', 'income')
                ->whereMonth('date', $month->month)
                ->whereYear('date', $month->year)
                ->sum('amount');
            $exp = FluxoCaixa::where('type', 'expense')
                ->whereMonth('date', $month->month)
                ->whereYear('date', $month->year)
                ->sum('amount');
            
            $fluxoHistorico[] = [
                'name' => $month->translatedFormat('M'),
                'receitas' => floatval($inc),
                'despesas' => floatval($exp),
            ];
        }

        return response()->json([
            'total_alunos_ativos' => $totalAlunosAtivos,
            'inadimplencia_mes' => $inadimplentes,
            'aniversariantes_dia' => $aniversariantesDia,
            'aniversariantes_mes' => $aniversariantesMes,
            'receitas_mes' => floatval($receitasMes),
            'despesas_mes' => floatval($despesasMes),
            'fluxo_historico' => $fluxoHistorico,
        ]);
    }
}
