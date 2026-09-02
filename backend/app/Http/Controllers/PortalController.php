<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Aluno;
use App\Models\Frequencia;
use App\Models\Avaliacao;
use App\Models\Mensalidade;

class PortalController extends Controller
{
    public function listFilhos(Request $request)
    {
        $parent = $request->get('auth_user');

        $filhos = Aluno::where('responsavel_id', $parent->id)
            ->with('turmas')
            ->get();

        return response()->json($filhos);
    }

    public function getFilhoDetalhes(Request $request, Aluno $aluno)
    {
        $parent = $request->get('auth_user');

        // Confirm parent ownership
        if ($aluno->responsavel_id !== $parent->id) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

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
        ]);
    }
}
