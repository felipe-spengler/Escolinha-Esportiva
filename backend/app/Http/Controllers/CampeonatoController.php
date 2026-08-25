<?php

namespace App\Http\Controllers;

use App\Models\Campeonato;
use App\Models\Equipe;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CampeonatoController extends Controller
{
    public function index()
    {
        $campeonatos = Campeonato::with('equipes')->get();
        return Inertia::render('Admin/Campeonatos/Index', [
            'campeonatos' => $campeonatos
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'data_inicio' => 'nullable|date',
            'data_fim' => 'nullable|date',
        ]);

        Campeonato::create($validated);
        return redirect()->back()->with('success', 'Campeonato criado com sucesso!');
    }

    // Outros métodos CRUD...
}
