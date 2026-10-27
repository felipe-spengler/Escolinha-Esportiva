<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Aluno;
use App\Models\Frequencia;
use App\Models\Avaliacao;
use App\Models\Mensalidade;

use App\Models\Setting;
use App\Services\MensalidadeService;
use Carbon\Carbon;

class PortalController extends Controller
{
    public function listFilhos(Request $request)
    {
        $parent = $request->get('auth_user');

        $filhos = Aluno::where('responsavel_id', $parent->id)->get();

        // Garante que cada filho ativo tenha sua mensalidade do mês gerada no sistema
        foreach ($filhos as $filho) {
            if ($filho->status === 'active') {
                MensalidadeService::garantirMensalidadeAluno($filho);
            }
        }

        $todayStr = Carbon::today()->toDateString();

        // Atualiza mensalidades pendentes vencidas para 'overdue' (somente se valor > 0 e vencimento anterior a hoje)
        $alunoIds = $filhos->pluck('id');
        Mensalidade::whereIn('aluno_id', $alunoIds)
            ->where('status', 'pending')
            ->where('amount', '>', 0)
            ->where('due_date', '<', $todayStr)
            ->update(['status' => 'overdue']);

        // Garante que mensalidades futuras ou com vencimento hoje NÃO fiquem com status 'overdue'
        Mensalidade::whereIn('aluno_id', $alunoIds)
            ->where('status', 'overdue')
            ->where('due_date', '>=', $todayStr)
            ->update(['status' => 'pending']);

        $filhosCarregados = Aluno::where('responsavel_id', $parent->id)
            ->with([
                'turmas',
                'mensalidades' => function ($q) {
                    $q->orderBy('due_date', 'desc');
                }
            ])
            ->get();

        return response()->json([
            'filhos' => $filhosCarregados,
            'settings' => Setting::first(),
        ]);
    }

    public function getFilhoDetalhes(Request $request, Aluno $aluno)
    {
        $parent = $request->get('auth_user');

        // Confirm parent ownership
        if ($aluno->responsavel_id !== $parent->id) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        // Garante que o aluno tenha a mensalidade do mês atual gerada
        if ($aluno->status === 'active') {
            MensalidadeService::garantirMensalidadeAluno($aluno);
        }

        $todayStr = Carbon::today()->toDateString();

        // Atualiza mensalidades pendentes vencidas para 'overdue' (somente se valor > 0 e vencimento anterior a hoje)
        Mensalidade::where('aluno_id', $aluno->id)
            ->where('status', 'pending')
            ->where('amount', '>', 0)
            ->where('due_date', '<', $todayStr)
            ->update(['status' => 'overdue']);

        // Garante que mensalidades futuras ou com vencimento hoje NÃO fiquem com status 'overdue'
        Mensalidade::where('aluno_id', $aluno->id)
            ->where('status', 'overdue')
            ->where('due_date', '>=', $todayStr)
            ->update(['status' => 'pending']);

        // Calculate attendance rate
        $totalClasses = Frequencia::where('aluno_id', $aluno->id)->count();
        $presentClasses = Frequencia::where('aluno_id', $aluno->id)
            ->where('status', 'present')
            ->count();

        $frequenciaPorcentagem = $totalClasses > 0 ? round(($presentClasses / $totalClasses) * 100) : 100;

        // Fetch all assessments
        $avaliacoes = Avaliacao::where('aluno_id', $aluno->id)
            ->with('professor:id,name')
            ->orderBy('date', 'desc')
            ->get();

        // Fetch all billing records
        $mensalidades = Mensalidade::where('aluno_id', $aluno->id)
            ->orderBy('due_date', 'desc')
            ->get();

        // Fetch attendance logs
        $frequencias = Frequencia::where('aluno_id', $aluno->id)
            ->with('turma')
            ->orderBy('date', 'desc')
            ->take(20)
            ->get();

        return response()->json([
            'aluno' => $aluno->load('turmas'),
            'frequencia_porcentagem' => $frequenciaPorcentagem,
            'frequencias' => $frequencias,
            'avaliacoes' => $avaliacoes,
            'mensalidades' => $mensalidades,
            'settings' => Setting::first(),
        ]);
    }
}
