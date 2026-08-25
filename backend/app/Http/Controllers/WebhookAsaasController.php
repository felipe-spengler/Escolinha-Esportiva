<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Mensalidade;
use App\Models\FluxoCaixa;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WebhookAsaasController extends Controller
{
    public function handle(Request $request)
    {
        Log::info("Webhook ASAAS recebido: ", $request->all());

        $event = $request->input('event');
        $paymentData = $request->input('payment');

        if (!$paymentData || !isset($paymentData['id'])) {
            return response()->json(['message' => 'Payload inválido'], 400);
        }

        $asaasPaymentId = $paymentData['id'];

        if (in_array($event, ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'])) {
            
            $mensalidade = Mensalidade::where('asaas_payment_id', $asaasPaymentId)->first();

            if ($mensalidade && $mensalidade->status !== 'paid') {
                DB::transaction(function () use ($mensalidade, $paymentData) {
                    $mensalidade->update([
                        'status' => 'paid',
                        'paid_at' => Carbon::parse($paymentData['paymentDate'] ?? now()),
                    ]);

                    FluxoCaixa::create([
                        'type' => 'income',
                        'origin_type' => 'mensalidade',
                        'origin_id' => $mensalidade->id,
                        'description' => 'Mensalidade (Asaas) - Aluno ID: ' . $mensalidade->aluno_id,
                        'amount' => $mensalidade->amount,
                        'date' => Carbon::today(),
                    ]);
                });
            }
        }

        return response()->json(['message' => 'Webhook processado com sucesso']);
    }
}
