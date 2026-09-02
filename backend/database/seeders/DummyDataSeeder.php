<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Responsavel;
use App\Models\Aluno;
use App\Models\Turma;
use App\Models\Mensalidade;
use App\Models\Produto;
use App\Models\FluxoCaixa;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('pt_BR');

        // Create some professors
        $professors = [];
        for ($i = 0; $i < 3; $i++) {
            $professors[] = User::create([
                'name' => 'Professor ' . $faker->firstName,
                'email' => $faker->unique()->safeEmail,
                'password' => Hash::make('senha123'),
                'role' => 'professor',
            ]);
        }

        // Create some turmas (classes)
        $turmas = [];
        foreach (['Sub-9', 'Sub-11', 'Sub-13', 'Sub-15'] as $index => $turmaName) {
            $turmas[] = Turma::create([
                'name' => $turmaName,
                'professor_id' => $professors[$index % count($professors)]->id,
                'schedule' => 'Seg/Qua 1' . ($index + 4) . ':00',
            ]);
        }

        // Create Responsaveis and Alunos
        for ($i = 0; $i < 20; $i++) {
            $responsavel = Responsavel::create([
                'name' => $faker->name,
                'email' => $faker->unique()->safeEmail,
                'password' => Hash::make('senha123'),
                'phone' => $faker->cellphoneNumber,
                'cpf' => $faker->cpf(false),
            ]);

            // Each responsavel has 1 to 2 alunos
            $numAlunos = rand(1, 2);
            for ($j = 0; $j < $numAlunos; $j++) {
                $aluno = Aluno::create([
                    'responsavel_id' => $responsavel->id,
                    'name' => $faker->firstName . ' ' . $faker->lastName,
                    'birth_date' => $faker->dateTimeBetween('-15 years', '-8 years')->format('Y-m-d'),
                    'status' => 'active',
                ]);

                // Enroll in a random turma
                $turma = $faker->randomElement($turmas);
                DB::table('matriculas')->insert([
                    'aluno_id' => $aluno->id,
                    'turma_id' => $turma->id,
                ]);

                // Create some mensalidades for the aluno
                for ($m = 0; $m < 3; $m++) {
                    $status = $faker->randomElement(['paid', 'pending', 'overdue']);
                    $amount = 120.00;
                    $mensalidade = Mensalidade::create([
                        'aluno_id' => $aluno->id,
                        'amount' => $amount,
                        'due_date' => clone $faker->dateTimeBetween('-2 months', '+1 month'),
                        'status' => $status,
                        'paid_at' => $status === 'paid' ? now() : null,
                    ]);

                    if ($status === 'paid') {
                        FluxoCaixa::create([
                            'type' => 'income',
                            'origin_type' => 'mensalidade',
                            'origin_id' => $mensalidade->id,
                            'description' => 'Mensalidade Aluno ' . $aluno->name,
                            'amount' => $amount,
                            'date' => now(),
                        ]);
                    }
                }
            }
        }

        // Create some Produtos and sales
        for ($i = 0; $i < 5; $i++) {
            $produto = Produto::create([
                'name' => 'Uniforme ' . $faker->randomElement(['P', 'M', 'G', 'GG']),
                'price' => 150.00,
                'stock_quantity' => rand(10, 50),
            ]);

            // Fake sale
            DB::table('vendas_produtos')->insert([
                'produto_id' => $produto->id,
                'quantity' => 1,
                'total_amount' => 150.00,
                'date' => now(),
            ]);

            FluxoCaixa::create([
                'type' => 'income',
                'origin_type' => 'venda_produto',
                'description' => 'Venda Uniforme',
                'amount' => 150.00,
                'date' => now(),
            ]);
        }
    }
}
