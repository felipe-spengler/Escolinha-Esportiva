<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\Aluno;
use App\Models\Responsavel;
use App\Models\Turma;
use App\Models\User;
use App\Models\Mensalidade;
use App\Models\FluxoCaixa;

class SystemController extends Controller
{
    // ==========================================
    // ALUNOS CRUD
    // ==========================================
    public function listAlunos()
    {
        return response()->json(Aluno::with(['responsavel', 'turmas'])->get());
    }

    public function storeAluno(Request $request)
    {
        $data = $request->validate([
            'responsavel_id' => 'required|exists:responsaveis,id',
            'name' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'status' => 'required|in:active,inactive,suspended',
            'medical_notes' => 'nullable|string',
            'photo' => 'nullable|string', // Base64 or standard file
            'turma_ids' => 'nullable|array',
            'mensalidade_valor' => 'nullable|numeric|min:0',
            'dia_vencimento' => 'nullable|integer|min:1|max:31',
        ]);

        $photoPath = null;
        if ($request->has('photo') && !empty($request->photo)) {
            // If base64
            if (preg_match('/^data:image\/(\w+);base64,/', $request->photo, $type)) {
                $image = substr($request->photo, strpos($request->photo, ',') + 1);
                $type = strtolower($type[1]);
                $image = base64_decode($image);
                $fileName = 'photo_' . time() . '.' . $type;
                Storage::disk('public')->put('alunos/' . $fileName, $image);
                $photoPath = '/storage/alunos/' . $fileName;
            } else {
                $photoPath = $request->photo;
            }
        } elseif ($request->hasFile('photo_file')) {
            $path = $request->file('photo_file')->store('alunos', 'public');
            $photoPath = '/storage/' . $path;
        }

        $aluno = Aluno::create([
            'responsavel_id' => $data['responsavel_id'],
            'name' => $data['name'],
            'birth_date' => $data['birth_date'],
            'status' => $data['status'],
            'medical_notes' => $data['medical_notes'] ?? null,
            'photo_path' => $photoPath,
            'mensalidade_valor' => $data['mensalidade_valor'] ?? 120.00,
            'dia_vencimento' => $data['dia_vencimento'] ?? 10,
        ]);

        if (!empty($data['turma_ids'])) {
            $aluno->turmas()->sync($data['turma_ids']);
        }

        return response()->json($aluno->load(['responsavel', 'turmas']), 201);
    }

    public function updateAluno(Request $request, Aluno $aluno)
    {
        $data = $request->validate([
            'responsavel_id' => 'required|exists:responsaveis,id',
            'name' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'status' => 'required|in:active,inactive,suspended',
            'medical_notes' => 'nullable|string',
            'photo' => 'nullable|string',
            'turma_ids' => 'nullable|array',
            'mensalidade_valor' => 'nullable|numeric|min:0',
            'dia_vencimento' => 'nullable|integer|min:1|max:31',
        ]);

        $photoPath = $aluno->photo_path;
        if ($request->has('photo') && !empty($request->photo) && str_starts_with($request->photo, 'data:')) {
            if (preg_match('/^data:image\/(\w+);base64,/', $request->photo, $type)) {
                $image = substr($request->photo, strpos($request->photo, ',') + 1);
                $type = strtolower($type[1]);
                $image = base64_decode($image);
                $fileName = 'photo_' . time() . '.' . $type;
                Storage::disk('public')->put('alunos/' . $fileName, $image);
                $photoPath = '/storage/alunos/' . $fileName;
            }
        } elseif ($request->hasFile('photo_file')) {
            $path = $request->file('photo_file')->store('alunos', 'public');
            $photoPath = '/storage/' . $path;
        }

        $aluno->update([
            'responsavel_id' => $data['responsavel_id'],
            'name' => $data['name'],
            'birth_date' => $data['birth_date'],
            'status' => $data['status'],
            'medical_notes' => $data['medical_notes'] ?? null,
            'photo_path' => $photoPath,
            'mensalidade_valor' => $data['mensalidade_valor'] ?? 120.00,
            'dia_vencimento' => $data['dia_vencimento'] ?? 10,
        ]);

        $aluno->turmas()->sync($data['turma_ids'] ?? []);

        return response()->json($aluno->load(['responsavel', 'turmas']));
    }

    public function deleteAluno(Aluno $aluno)
    {
        $aluno->delete();
        return response()->json(['message' => 'Aluno deletado com sucesso']);
    }

    public function mensalidadesHistory(Aluno $aluno)
    {
        $mensalidades = Mensalidade::where('aluno_id', $aluno->id)
            ->orderBy('due_date', 'desc')
            ->get();

        // Enriquecer com a forma de pagamento se estiver paga
        $mensalidades = $mensalidades->map(function ($m) {
            $paymentMethod = null;
            if ($m->status === 'paid') {
                $fluxo = FluxoCaixa::where('origin_type', 'mensalidade')
                    ->where('origin_id', $m->id)
                    ->first();
                
                if ($fluxo) {
                    if (str_contains($fluxo->description, 'Asaas')) {
                        $paymentMethod = 'Asaas (Pix/Boleto)';
                    } else {
                        $paymentMethod = 'Baixa Manual';
                    }
                } else {
                    // Fallback
                    $paymentMethod = 'Manual / Desconhecido';
                }
            }
            
            $m->payment_method = $paymentMethod;
            return $m;
        });

        return response()->json($mensalidades);
    }

    // ==========================================
    // RESPONSÁVEIS CRUD
    // ==========================================
    public function listResponsaveis()
    {
        return response()->json(Responsavel::all());
    }

    public function storeResponsavel(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:responsaveis,email',
            'password' => 'required|string|min:6',
            'phone' => 'required|string',
            'cpf' => 'required|string|unique:responsaveis,cpf',
        ]);

        $responsavel = Responsavel::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'],
            'cpf' => $data['cpf'],
        ]);

        return response()->json($responsavel, 201);
    }

    public function updateResponsavel(Request $request, Responsavel $responsavel)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:responsaveis,email,' . $responsavel->id,
            'phone' => 'required|string',
            'cpf' => 'required|string|unique:responsaveis,cpf,' . $responsavel->id,
            'password' => 'nullable|string|min:6',
        ]);

        $updateData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'cpf' => $data['cpf'],
        ];

        if (!empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $responsavel->update($updateData);
        return response()->json($responsavel);
    }

    public function deleteResponsavel(Responsavel $responsavel)
    {
        $responsavel->delete();
        return response()->json(['message' => 'Responsável deletado com sucesso']);
    }

    // ==========================================
    // TURMAS CRUD
    // ==========================================
    public function listTurmas()
    {
        return response()->json(Turma::with(['professor', 'alunos'])->get());
    }

    public function storeTurma(Request $request)
    {
        $data = $request->validate([
            'professor_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'schedule' => 'required|string|max:255',
        ]);

        $turma = Turma::create($data);
        return response()->json($turma->load('professor'), 201);
    }

    public function updateTurma(Request $request, Turma $turma)
    {
        $data = $request->validate([
            'professor_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'schedule' => 'required|string|max:255',
        ]);

        $turma->update($data);
        return response()->json($turma->load('professor'));
    }

    public function deleteTurma(Turma $turma)
    {
        $turma->delete();
        return response()->json(['message' => 'Turma deletada com sucesso']);
    }

    // ==========================================
    // PROFESSORES CRUD (Users table with role 'professor')
    // ==========================================
    public function listProfessores()
    {
        return response()->json(User::where('role', 'professor')->get());
    }

    public function storeProfessor(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $prof = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'professor',
        ]);

        return response()->json($prof, 201);
    }

    public function updateProfessor(Request $request, User $professor)
    {
        if ($professor->role !== 'professor') {
            return response()->json(['message' => 'User is not a professor'], 400);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $professor->id,
            'password' => 'nullable|string|min:6',
        ]);

        $updateData = [
            'name' => $data['name'],
            'email' => $data['email'],
        ];

        if (!empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $professor->update($updateData);
        return response()->json($professor);
    }

    public function deleteProfessor(User $professor)
    {
        if ($professor->role !== 'professor') {
            return response()->json(['message' => 'User is not a professor'], 400);
        }
        $professor->delete();
        return response()->json(['message' => 'Professor deletado com sucesso']);
    }
}
