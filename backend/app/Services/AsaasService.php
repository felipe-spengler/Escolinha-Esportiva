<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AsaasService
{
    protected ?string $token;
    protected string $apiUrl;

    public function __construct()
    {
        $this->token = config('services.asaas.token') ?? env('ASAAS_TOKEN', 'dummysandboxtoken');
        $this->apiUrl = env('ASAAS_ENV') === 'production'
            ? 'https://api.asaas.com/v3'
            : 'https://sandbox.asaas.com/api/v3';
    }

    public function request(string $endpoint, string $method = 'GET', array $data = []): array
    {
        if (!$this->token) {
            throw new \Exception("Configuração do Asaas (Token) não encontrada.");
        }

        $url = $this->apiUrl . $endpoint;
        $response = Http::withHeaders([
            'access_token' => $this->token,
            'User-Agent' => 'EscolinhaEsporte/1.0'
        ]);

        $response = match (strtoupper($method)) {
            'POST'   => $response->post($url, $data),
            'PUT'    => $response->put($url, $data),
            'DELETE' => $response->delete($url, $data),
            default  => $response->get($url, $data),
        };

        if ($response->failed()) {
            $error = $response->json();
            $msg = $error['errors'][0]['description'] ?? 'Erro desconhecido no Asaas';
            Log::error("Asaas API Error: " . $response->body());
            throw new \Exception($msg);
        }

        return $response->json() ?? [];
    }

    public function getOrCreateCustomer($responsavel): string
    {
        if ($responsavel->asaas_customer_id) {
            return $responsavel->asaas_customer_id;
        }

        $cpf = preg_replace('/[^0-9]/', '', $responsavel->cpf ?? '');

        if (!empty($cpf)) {
            $search = $this->request("/customers?cpfCnpj={$cpf}");
            if (!empty($search['data'])) {
                foreach ($search['data'] as $customer) {
                    $customerCpf = preg_replace('/[^0-9]/', '', $customer['cpfCnpj'] ?? '');
                    if ($customerCpf === $cpf) {
                        $responsavel->update(['asaas_customer_id' => $customer['id']]);
                        return $customer['id'];
                    }
                }
            }
        }

        $payload = [
            'name' => $responsavel->name,
            'cpfCnpj' => $cpf ?: '00000000000', // fallback
            'email' => $responsavel->email,
            'mobilePhone' => preg_replace('/[^0-9]/', '', $responsavel->phone ?? ''),
            'externalReference' => (string) $responsavel->id,
            'notificationDisabled' => false
        ];

        $customer = $this->request('/customers', 'POST', $payload);
        $responsavel->update(['asaas_customer_id' => $customer['id']]);
        
        return $customer['id'];
    }

    public function createPayment($responsavel, $amount, string $description, string $externalReference, ?string $dueDate = null, float $interest = 1.00, float $fine = 2.00): array
    {
        $customerId = $this->getOrCreateCustomer($responsavel);

        if (!$dueDate) {
            $dueDate = now()->addDays(3)->format('Y-m-d');
        }

        $payload = [
            'customer' => $customerId,
            'billingType' => 'PIX',
            'value' => $amount,
            'dueDate' => $dueDate,
            'description' => $description,
            'externalReference' => $externalReference,
            'postalService' => false,
            'fine' => [
                'value' => $fine,
                'type' => 'PERCENTAGE'
            ],
            'interest' => [
                'value' => $interest,
                'type' => 'PERCENTAGE'
            ]
        ];

        $payment = $this->request('/payments', 'POST', $payload);

        if (isset($payment['id']) && $payment['billingType'] === 'PIX') {
            try {
                $pixData = $this->request("/payments/{$payment['id']}/pixQrCode");
                $payment['pix_payload'] = $pixData['payload'] ?? null;
            } catch (\Exception $e) {
                Log::error("Failed to fetch PIX QR Code for payment {$payment['id']}: " . $e->getMessage());
            }
        }

        return $payment;
    }
}
