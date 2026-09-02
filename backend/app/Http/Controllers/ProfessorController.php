<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Turma;
use App\Models\Aluno;
use App\Models\Frequencia;
use App\Models\Avaliacao;
use Carbon\Carbon;

class ProfessorController extends Controller
{
    // ==========================================
    // ATTENDANCE (CHAMADA)
    // ==========================================
    public function listChamada(Request $request)
    {
        $request->validate([
            'turma_id' => 'required|exists:turmas,id',
            'date' => 'required|date',
        ]);

        $turmaId = $request->turma_id;
        $date = $request->date;

        $turma = Turma::with('alunos')->findOrFail($turmaId);
        
        // Find existing frequencies for this class and date
        $existing = Frequencia::where('turma_id', $turmaId)
            ->where('date', $date)
            ->get()
            ->keyBy('aluno_id');

        $alunos = $turma->alunos->map(function ($aluno) use ($existing) {
            return [
                'id' => $aluno->id,
                'name' => $aluno->name,
                'status' => $existing->has($aluno->id) ? $existing->get($aluno->id)->status : 'present', // Default present
            ];
        });

        return response()->json([
            'turma' => [
                'id' => $turma->id,
                'name' => $turma->name,
            ],
            'date' => $date,
            'alunos' => $alunos,
        ]);
    }

    public function saveChamada(Request $request)
    {
        $request->validate([
            'turma_id' => 'required|exists:turmas,id',
            'date' => 'required|date',
            'chamada' => 'required|array', // Array of [aluno_id => 'present'|'absent']
        ]);

        $turmaId = $request->turma_id;
        $date = $request->date;
        $chamada = $request->chamada;

        foreach ($chamada as $alunoId => $status) {
            Frequencia::updateOrCreate(
                [
                    'turma_id' => $turmaId,
                    'aluno_id' => $alunoId,
                    'date' => $date,
                ],
                [
                    'status' => $status,
                ]
            );
        }

        return response()->json(['message' => 'Chamada salva com sucesso!']);
    }

    // ==========================================
    // ASSESSMENT (AVALIAÇÃO)
    // ==========================================
    public function storeAvaliacao(Request $request)
    {
        $data = $request->validate([
            'aluno_id' => 'required|exists:alunos,id',
            'passe' => 'required|integer|min:1|max:10',
            'chute' => 'required|integer|min:1|max:10',
            'dominio' => 'required|integer|min:1|max:10',
            'condicionamento' => 'required|integer|min:1|max:10',
            'disciplina' => 'required|integer|min:1|max:10',
            'parecer' => 'nullable|string',
            'date' => 'required|date',
        ]);

        $auth_user = $request->get('auth_user');

        $avaliacao = Avaliacao::create(array_merge($data, [
            'professor_id' => $auth_user->id,
        ]));

        return response()->json($avaliacao, 201);
    }

    public function listAvaliacoes(Aluno $aluno)
    {
        $avaliacoes = Avaliacao::where('aluno_id', $aluno->id)
            ->with('professor:id,name')
            ->orderBy('date', 'desc')
            ->get();

        return response()->json($avaliacoes);
    }

    public function listAllAvaliacoes(Request $request)
    {
        $query = Avaliacao::with(['aluno', 'professor:id,name']);

        if ($request->has('turma_id') && $request->turma_id) {
            $query->whereHas('aluno.turmas', function ($q) use ($request) {
                $q->where('turmas.id', $request->turma_id);
            });
        }

        if ($request->has('aluno_id') && $request->aluno_id) {
            $query->where('aluno_id', $request->aluno_id);
        }

        return response()->json($query->orderBy('date', 'desc')->get());
    }

    public function updateAvaliacao(Request $request, Avaliacao $avaliacao)
    {
        $data = $request->validate([
            'passe' => 'required|integer|min:1|max:10',
            'chute' => 'required|integer|min:1|max:10',
            'dominio' => 'required|integer|min:1|max:10',
            'condicionamento' => 'required|integer|min:1|max:10',
            'disciplina' => 'required|integer|min:1|max:10',
            'parecer' => 'nullable|string',
            'date' => 'required|date',
        ]);

        $avaliacao->update($data);
        return response()->json($avaliacao);
    }

    public function deleteAvaliacao(Avaliacao $avaliacao)
    {
        $avaliacao->delete();
        return response()->json(['message' => 'Avaliação excluída com sucesso!']);
    }
}
