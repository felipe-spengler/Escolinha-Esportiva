<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Mensalidade;
use App\Models\Aluno;
use App\Models\Produto;
use App\Models\VendaProduto;
use App\Models\FluxoCaixa;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FinanceController extends Controller
{
    // ==========================================
    // MENSALIDADES
    // ==========================================
    public function listMensalidades(Request $request)
    {
        // Pegar apenas a mensalidade mais recente de cada aluno (status atual real)
        $latestIds = DB::table('mensalidades')
            ->select(DB::raw('MAX(id) as id'))
            ->groupBy('aluno_id')
            ->pluck('id');

        $query = Mensalidade::with('aluno.responsavel')
            ->whereIn('id', $latestIds);

        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('due_date', 'desc')->get());
    }

    public function darBaixaManual(Mensalidade $mensalidade)
    {
        if ($mensalidade->status === 'paid') {
            return response()->json(['message' => 'Mensalidade já está paga.'], 400);
        }

        DB::transaction(function () use ($mensalidade) {
            $mensalidade->update([
                'status' => 'paid',
                'paid_at' => Carbon::now(),
            ]);

            // Registrar no fluxo de caixa
            FluxoCaixa::create([
                'type' => 'income',
                'origin_type' => 'mensalidade',
                'origin_id' => $mensalidade->id,
                'description' => 'Mensalidade - Aluno: ' . $mensalidade->aluno->name,
                'amount' => $mensalidade->amount,
                'date' => Carbon::today(),
            ]);
        });

        return response()->json($mensalidade->load('aluno'));
    }

    public function gerarMensalidadesMes(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
        ]);

        $amount = $request->amount;
        $dueDate = $request->due_date;

        $alunosAtivos = Aluno::with('responsavel')->where('status', 'active')->get();
        $criadas = 0;
        
        $asaasService = new \App\Services\AsaasService();

        foreach ($alunosAtivos as $aluno) {
            $exists = Mensalidade::where('aluno_id', $aluno->id)
                ->where('due_date', $dueDate)
                ->exists();

            if (!$exists && $aluno->responsavel) {
                try {
                    $mensalidade = Mensalidade::create([
                        'aluno_id' => $aluno->id,
                        'amount' => $amount,
                        'due_date' => $dueDate,
                        'status' => 'pending',
                    ]);

                    $payment = $asaasService->createPayment(
                        $aluno->responsavel,
                        $amount,
                        "Mensalidade Escolinha - Aluno: {$aluno->name}",
                        (string) $mensalidade->id,
                        $dueDate
                    );

                    if (isset($payment['id'])) {
                        $mensalidade->update([
                            'asaas_payment_id' => $payment['id'],
                            'payment_url' => $payment['invoiceUrl'] ?? null,
                            'invoice_url' => $payment['bankSlipUrl'] ?? null,
                            'pix_code' => $payment['pix_payload'] ?? null,
                        ]);
                    }

                    $criadas++;
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Erro Asaas Mensalidade ID {$mensalidade->id}: " . $e->getMessage());
                }
            }
        }

        return response()->json([
            'message' => "Mensalidades geradas com sucesso! total: {$criadas}",
        ]);
    }

    // ==========================================
    // CONFIGURAÇÕES GERAIS (Settings)
    // ==========================================
    public function getSettings()
    {
        $setting = Setting::first();
        if (!$setting) {
            $setting = Setting::create(['juros_mensal' => 1.00, 'multa_atraso' => 2.00]);
        }
        return response()->json($setting);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate([
            'juros_mensal' => 'required|numeric|min:0|max:100',
            'multa_atraso' => 'required|numeric|min:0|max:100',
        ]);

        $setting = Setting::first();
        if (!$setting) {
            $setting = Setting::create($data);
        } else {
            $setting->update($data);
        }

        return response()->json($setting);
    }

    // ==========================================
    // LOJA / PDV
    // ==========================================
    public function listProdutos()
    {
        return response()->json(Produto::all());
    }

    public function storeProduto(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
        ]);

        $produto = Produto::create($data);
        return response()->json($produto, 201);
    }

    public function updateProduto(Request $request, Produto $produto)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
        ]);

        $produto->update($data);
        return response()->json($produto);
    }

    public function deleteProduto(Produto $produto)
    {
        $produto->delete();
        return response()->json(['message' => 'Produto deletado com sucesso']);
    }

    public function venderProduto(Request $request)
    {
        $request->validate([
            'produto_id' => 'required|exists:produtos,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $produto = Produto::findOrFail($request->produto_id);

        if ($produto->stock_quantity < $request->quantity) {
            return response()->json(['message' => 'Estoque insuficiente'], 400);
        }

        $totalAmount = $produto->price * $request->quantity;

        DB::transaction(function () use ($produto, $request, $totalAmount) {
            // 1. Reduzir estoque
            $produto->decrement('stock_quantity', $request->quantity);

            // 2. Registrar venda
            $venda = VendaProduto::create([
                'produto_id' => $produto->id,
                'quantity' => $request->quantity,
                'total_amount' => $totalAmount,
                'date' => Carbon::today(),
            ]);

            // 3. Registrar fluxo de caixa
            FluxoCaixa::create([
                'type' => 'income',
                'origin_type' => 'venda_produto',
                'origin_id' => $venda->id,
                'description' => "Venda Loja - {$produto->name} (x{$request->quantity})",
                'amount' => $totalAmount,
                'date' => Carbon::today(),
            ]);
        });

        return response()->json([
            'message' => 'Venda realizada com sucesso!',
            'produto' => $produto->fresh(),
        ]);
    }

    // ==========================================
    // FLUXO DE CAIXA (Lançamentos Gerais/Saídas)
    // ==========================================
    public function listFluxoCaixa()
    {
        return response()->json(FluxoCaixa::orderBy('date', 'desc')->get());
    }

    public function storeFluxoCaixa(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|in:income,expense',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
        ]);

        $fluxo = FluxoCaixa::create(array_merge($data, [
            'origin_type' => 'avulso',
        ]));

        return response()->json($fluxo, 201);
    }
}
