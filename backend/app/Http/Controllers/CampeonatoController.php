<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Campeonato;
use App\Models\Equipe;
use App\Models\CampeonatoJogador;
use App\Models\Jogo;
use App\Models\EventoJogo;

class CampeonatoController extends Controller
{
    // --- CAMPEONATOS ---
    public function index()
    {
        return response()->json(Campeonato::with('equipes', 'jogos.equipeCasa', 'jogos.equipeVisitante')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);
        
        $campeonato = Campeonato::create($validated);
        return response()->json($campeonato, 201);
    }

    public function update(Request $request, Campeonato $campeonato)
    {
        $campeonato->update($request->all());
        return response()->json($campeonato);
    }

    public function destroy(Campeonato $campeonato)
    {
        $campeonato->delete();
        return response()->json(['message' => 'Campeonato excluído.']);
    }

    // --- EQUIPES ---
    public function getEquipes(Campeonato $campeonato)
    {
        return response()->json($campeonato->equipes()->with('jogadores.aluno')->get());
    }

    public function storeEquipe(Request $request, Campeonato $campeonato)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'coach_name' => 'nullable|string',
        ]);

        $equipe = $campeonato->equipes()->create($validated);
        return response()->json($equipe, 201);
    }

    public function destroyEquipe(Equipe $equipe)
    {
        $equipe->delete();
        return response()->json(['message' => 'Equipe excluída.']);
    }

    // --- JOGADORES DA EQUIPE ---
    public function storeJogador(Request $request, Equipe $equipe)
    {
        $validated = $request->validate([
            'is_aluno' => 'required|boolean',
            'aluno_id' => 'nullable|exists:alunos,id',
            'name' => 'nullable|string',
            'number' => 'required|integer',
        ]);

        $jogador = $equipe->jogadores()->create($validated);
        return response()->json($jogador, 201);
    }

    public function destroyJogador(CampeonatoJogador $jogador)
    {
        $jogador->delete();
        return response()->json(['message' => 'Jogador removido da equipe.']);
    }

    // --- JOGOS ---
    public function storeJogo(Request $request, Campeonato $campeonato)
    {
        $validated = $request->validate([
            'equipe_casa_id' => 'required|exists:equipes,id',
            'equipe_visitante_id' => 'required|exists:equipes,id',
            'date' => 'required|date',
            'time' => 'nullable|date_format:H:i',
        ]);

        $jogo = $campeonato->jogos()->create($validated);
        return response()->json($jogo, 201);
    }

    public function updateJogo(Request $request, Jogo $jogo)
    {
        $jogo->update($request->all());
        return response()->json($jogo);
    }

    public function finalizarJogo(Request $request, Jogo $jogo)
    {
        $jogo->update([
            'status' => 'finished',
            'gols_casa' => $request->gols_casa ?? $jogo->gols_casa,
            'gols_visitante' => $request->gols_visitante ?? $jogo->gols_visitante,
        ]);
        return response()->json($jogo);
    }

    // --- SÚMULA (EVENTOS DO JOGO) ---
    public function getEventos(Jogo $jogo)
    {
        return response()->json($jogo->eventos()->with('jogador.aluno')->get());
    }

    public function storeEvento(Request $request, Jogo $jogo)
    {
        $validated = $request->validate([
            'jogador_id' => 'nullable|exists:campeonato_jogadores,id',
            'minute' => 'required|integer',
            'type' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $evento = $jogo->eventos()->create($validated);

        // Auto update score if goal
        if ($evento->type === 'goal' && $evento->jogador_id) {
            $jogador = CampeonatoJogador::find($evento->jogador_id);
            if ($jogador->equipe_id == $jogo->equipe_casa_id) {
                $jogo->increment('gols_casa');
            } else if ($jogador->equipe_id == $jogo->equipe_visitante_id) {
                $jogo->increment('gols_visitante');
            }
        }

        return response()->json($evento, 201);
    }

    public function destroyEvento(EventoJogo $evento)
    {
        // Revert goal if it was a goal
        if ($evento->type === 'goal' && $evento->jogador_id) {
            $jogo = $evento->jogo;
            $jogador = CampeonatoJogador::find($evento->jogador_id);
            if ($jogador->equipe_id == $jogo->equipe_casa_id && $jogo->gols_casa > 0) {
                $jogo->decrement('gols_casa');
            } else if ($jogador->equipe_id == $jogo->equipe_visitante_id && $jogo->gols_visitante > 0) {
                $jogo->decrement('gols_visitante');
            }
        }

        $evento->delete();
        return response()->json(['message' => 'Evento removido.']);
    }
}
