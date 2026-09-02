<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\ProfessorController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\PortalController;

// --- PUBLIC ROUTE ---
Route::post('/auth/login', [AuthController::class, 'login']);

// --- WEBHOOKS ---
Route::post('/webhook/asaas', [\App\Http\Controllers\WebhookAsaasController::class, 'handle']);

// --- PROTECTED ROUTES ---
Route::middleware('api.auth')->group(function () {
    
    // Auth info & logout
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Dashboard data
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Alunos
    Route::get('/alunos', [SystemController::class, 'listAlunos']);
    Route::post('/alunos', [SystemController::class, 'storeAluno']);
    Route::put('/alunos/{aluno}', [SystemController::class, 'updateAluno']);
    Route::delete('/alunos/{aluno}', [SystemController::class, 'deleteAluno']);

    // Responsáveis
    Route::get('/responsaveis', [SystemController::class, 'listResponsaveis']);
    Route::post('/responsaveis', [SystemController::class, 'storeResponsavel']);
    Route::put('/responsaveis/{responsavel}', [SystemController::class, 'updateResponsavel']);
    Route::delete('/responsaveis/{responsavel}', [SystemController::class, 'deleteResponsavel']);

    // Turmas
    Route::get('/turmas', [SystemController::class, 'listTurmas']);
    Route::post('/turmas', [SystemController::class, 'storeTurma']);
    Route::put('/turmas/{turma}', [SystemController::class, 'updateTurma']);
    Route::delete('/turmas/{turma}', [SystemController::class, 'deleteTurma']);

    // Professores
    Route::get('/professores', [SystemController::class, 'listProfessores']);
    Route::post('/professores', [SystemController::class, 'storeProfessor']);
    Route::put('/professores/{professor}', [SystemController::class, 'updateProfessor']);
    Route::delete('/professores/{professor}', [SystemController::class, 'deleteProfessor']);

    // Chamada (Attendance)
    Route::get('/chamada', [ProfessorController::class, 'listChamada']);
    Route::post('/chamada', [ProfessorController::class, 'saveChamada']);

    // Avaliações (Assessments)
    Route::get('/avaliacoes', [ProfessorController::class, 'listAllAvaliacoes']);
    Route::get('/avaliacoes/{aluno}', [ProfessorController::class, 'listAvaliacoes']);
    Route::post('/avaliacoes', [ProfessorController::class, 'storeAvaliacao']);
    Route::put('/avaliacoes/{avaliacao}', [ProfessorController::class, 'updateAvaliacao']);
    Route::delete('/avaliacoes/{avaliacao}', [ProfessorController::class, 'deleteAvaliacao']);

    // Mensalidades
    Route::get('/mensalidades', [FinanceController::class, 'listMensalidades']);
    Route::post('/mensalidades/gerar', [FinanceController::class, 'gerarMensalidadesMes']);
    Route::patch('/mensalidades/{mensalidade}/pix', [FinanceController::class, 'updatePix']);
    Route::post('/mensalidades/{mensalidade}/baixa', [FinanceController::class, 'darBaixaManual']);

    // Settings
    Route::get('/settings', [FinanceController::class, 'getSettings']);
    Route::post('/settings', [FinanceController::class, 'updateSettings']);

    // Loja (PDV)
    Route::get('/produtos', [FinanceController::class, 'listProdutos']);
    Route::post('/produtos', [FinanceController::class, 'storeProduto']);
    Route::put('/produtos/{produto}', [FinanceController::class, 'updateProduto']);
    Route::delete('/produtos/{produto}', [FinanceController::class, 'deleteProduto']);
    Route::post('/produtos/vender', [FinanceController::class, 'venderProduto']);

    // Fluxo de Caixa (Lançamentos Gerais)
    Route::get('/fluxo-caixa', [FinanceController::class, 'listFluxoCaixa']);
    Route::post('/fluxo-caixa', [FinanceController::class, 'storeFluxoCaixa']);

    // Portal dos Pais
    Route::get('/portal/filhos', [PortalController::class, 'listFilhos']);
    Route::get('/portal/filhos/{aluno}', [PortalController::class, 'getFilhoDetalhes']);
});
