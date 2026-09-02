<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Responsavel;
use App\Models\Aluno;
use App\Models\Turma;
use App\Models\Frequencia;
use App\Models\Mensalidade;
use App\Models\Produto;
use App\Models\VendaProduto;
use App\Models\FluxoCaixa;
use App\Models\Avaliacao;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin
        $admin = User::create([
            'name' => 'Diretor Felipe',
            'email' => 'admin@admin.com',
            'password' => Hash::make('senha123'),
            'role' => 'admin',
        ]);

        // 2. Professores
        $prof1 = User::create([
            'name' => 'Professor Carlos',
            'email' => 'carlos@projeto.com',
            'password' => Hash::make('senha123'),
            'role' => 'professor',
        ]);

        $prof2 = User::create([
            'name' => 'Professor Marcos',
            'email' => 'marcos@projeto.com',
            'password' => Hash::make('senha123'),
            'role' => 'professor',
        ]);

        // 3. Responsáveis
        $resp1 = Responsavel::create([
            'name' => 'Roberto Silva',
            'email' => 'pai1@projeto.com',
            'password' => Hash::make('senha123'),
            'phone' => '(45) 99887-6655',
            'cpf' => '111.222.333-44',
        ]);

        $resp2 = Responsavel::create([
            'name' => 'Ana Santos',
            'email' => 'mae2@projeto.com',
            'password' => Hash::make('senha123'),
            'phone' => '(45) 99776-5544',
            'cpf' => '222.333.444-55',
        ]);

        $resp3 = Responsavel::create([
            'name' => 'Juliana Souza',
            'email' => 'mae3@projeto.com',
            'password' => Hash::make('senha123'),
            'phone' => '(45) 99665-4433',
            'cpf' => '333.444.555-66',
        ]);

        // 4. Alunos
        $aluno1 = Aluno::create([
            'responsavel_id' => $resp1->id,
            'name' => 'Pedro Silva',
            'birth_date' => '2016-04-12',
            'status' => 'active',
            'medical_notes' => 'Nenhuma restrição alimentar. Alérgico a picada de abelha.',
            'photo_path' => 'https://picsum.photos/seed/pedro/200/200',
        ]);

        $aluno2 = Aluno::create([
            'responsavel_id' => $resp2->id,
            'name' => 'Lucas Santos',
            'birth_date' => '2015-08-20',
            'status' => 'active',
            'medical_notes' => 'Asma leve. Usa bombinha se necessário.',
            'photo_path' => 'https://picsum.photos/seed/lucas/200/200',
        ]);

        $aluno3 = Aluno::create([
            'responsavel_id' => $resp3->id,
            'name' => 'Gabriel Souza',
            'birth_date' => '2017-11-05',
            'status' => 'active',
            'medical_notes' => 'Nenhuma restrição.',
            'photo_path' => 'https://picsum.photos/seed/gabriel/200/200',
        ]);

        $aluno4 = Aluno::create([
            'responsavel_id' => $resp1->id,
            'name' => 'Mateus Silva',
            'birth_date' => '2014-02-18',
            'status' => 'suspended',
            'medical_notes' => 'Nenhuma restrição.',
            'photo_path' => 'https://picsum.photos/seed/mateus/200/200',
        ]);

        // 5. Turmas
        $turma1 = Turma::create([
            'professor_id' => $prof1->id,
            'name' => 'Sub-11 Terça/Quinta',
            'schedule' => '14:00 - 15:30',
        ]);

        $turma2 = Turma::create([
            'professor_id' => $prof2->id,
            'name' => 'Sub-13 Segunda/Quarta',
            'schedule' => '16:00 - 17:30',
        ]);

        // Matriculas
        $aluno1->turmas()->attach($turma1->id);
        $aluno3->turmas()->attach($turma1->id);
        
        $aluno2->turmas()->attach($turma2->id);
        $aluno4->turmas()->attach($turma2->id);

        // 6. Frequencias
        $datasChamada = [
            Carbon::today()->subDays(6)->toDateString(),
            Carbon::today()->subDays(4)->toDateString(),
            Carbon::today()->subDays(2)->toDateString(),
        ];

        foreach ($datasChamada as $dt) {
            // Turma 1
            Frequencia::create(['aluno_id' => $aluno1->id, 'turma_id' => $turma1->id, 'date' => $dt, 'status' => 'present']);
            Frequencia::create(['aluno_id' => $aluno3->id, 'turma_id' => $turma1->id, 'date' => $dt, 'status' => rand(0, 1) ? 'present' : 'absent']);

            // Turma 2
            Frequencia::create(['aluno_id' => $aluno2->id, 'turma_id' => $turma2->id, 'date' => $dt, 'status' => 'present']);
            Frequencia::create(['aluno_id' => $aluno4->id, 'turma_id' => $turma2->id, 'date' => $dt, 'status' => 'absent']);
        }

        // 7. Mensalidades
        // Pedro
        Mensalidade::create(['aluno_id' => $aluno1->id, 'amount' => 120.00, 'due_date' => Carbon::now()->subMonth()->startOfMonth()->addDays(9)->toDateString(), 'status' => 'paid', 'paid_at' => Carbon::now()->subMonth()->startOfMonth()->addDays(5)]);
        Mensalidade::create(['aluno_id' => $aluno1->id, 'amount' => 120.00, 'due_date' => Carbon::today()->addDays(5)->toDateString(), 'status' => 'pending', 'pix_code' => '00020101021126580014br.gov.pix.01369528f1fb-26ad-452f-bd1a-96695627ea705204000053039865406120.005802BR5915ESCOLINHA FUT6009TOLEDO62070503***6304E21A']);
        
        // Lucas
        Mensalidade::create(['aluno_id' => $aluno2->id, 'amount' => 120.00, 'due_date' => Carbon::now()->subMonth()->startOfMonth()->addDays(9)->toDateString(), 'status' => 'overdue']);
        Mensalidade::create(['aluno_id' => $aluno2->id, 'amount' => 120.00, 'due_date' => Carbon::today()->addDays(5)->toDateString(), 'status' => 'pending', 'pix_code' => '00020101021126580014br.gov.pix.01369528f1fb-26ad-452f-bd1a-96695627ea705204000053039865406120.005802BR5915ESCOLINHA FUT6009TOLEDO62070503***6304E21A']);

        // Gabriel
        Mensalidade::create(['aluno_id' => $aluno3->id, 'amount' => 120.00, 'due_date' => Carbon::today()->addDays(5)->toDateString(), 'status' => 'pending', 'pix_code' => '00020101021126580014br.gov.pix.01369528f1fb-26ad-452f-bd1a-96695627ea705204000053039865406120.005802BR5915ESCOLINHA FUT6009TOLEDO62070503***6304E21A']);

        // 8. Produtos
        $prodUniforme = Produto::create(['name' => 'Uniforme Oficial Escolinha', 'price' => 85.00, 'stock_quantity' => 20]);
        $prodMeiao = Produto::create(['name' => 'Meião Verde/Branco', 'price' => 25.00, 'stock_quantity' => 50]);
        $prodSqueeze = Produto::create(['name' => 'Garrafa Térmica Squeeze', 'price' => 35.00, 'stock_quantity' => 15]);

        // 9. Fluxo de Caixa (Lançamentos de teste)
        // Receitas anteriores
        FluxoCaixa::create(['type' => 'income', 'origin_type' => 'mensalidade', 'origin_id' => 1, 'description' => 'Mensalidade - Aluno: Pedro Silva', 'amount' => 120.00, 'date' => Carbon::now()->subMonth()->toDateString()]);
        
        // Venda produto
        $v1 = VendaProduto::create(['produto_id' => $prodUniforme->id, 'quantity' => 1, 'total_amount' => 85.00, 'date' => Carbon::now()->subDays(10)->toDateString()]);
        FluxoCaixa::create(['type' => 'income', 'origin_type' => 'venda_produto', 'origin_id' => $v1->id, 'description' => 'Venda Loja - Uniforme Oficial Escolinha (x1)', 'amount' => 85.00, 'date' => Carbon::now()->subDays(10)->toDateString()]);

        // Despesas
        FluxoCaixa::create(['type' => 'expense', 'origin_type' => 'avulso', 'description' => 'Aluguel Quadra Sintética', 'amount' => 450.00, 'date' => Carbon::now()->subDays(15)->toDateString()]);
        FluxoCaixa::create(['type' => 'expense', 'origin_type' => 'avulso', 'description' => 'Compra de Bolas Novas', 'amount' => 180.00, 'date' => Carbon::now()->subDays(8)->toDateString()]);
        FluxoCaixa::create(['type' => 'expense', 'origin_type' => 'avulso', 'description' => 'Conta de Energia/Luz', 'amount' => 120.00, 'date' => Carbon::now()->subDays(2)->toDateString()]);

        // 10. Avaliações Técnicas
        Avaliacao::create([
            'aluno_id' => $aluno1->id,
            'professor_id' => $prof1->id,
            'passe' => 8,
            'chute' => 7,
            'dominio' => 9,
            'condicionamento' => 8,
            'disciplina' => 10,
            'parecer' => 'Pedro demonstra excelente técnica e domínio de bola. Precisa focar um pouco mais nos treinos de finalização.',
            'date' => Carbon::now()->subDays(5)->toDateString(),
        ]);

        // Older evaluation for Pedro to show history
        Avaliacao::create([
            'aluno_id' => $aluno1->id,
            'professor_id' => $prof1->id,
            'passe' => 6,
            'chute' => 5,
            'dominio' => 7,
            'condicionamento' => 6,
            'disciplina' => 9,
            'parecer' => 'Pedro iniciou na escolinha mostrando talento, mas o condicionamento físico precisa melhorar.',
            'date' => Carbon::now()->subMonths(3)->toDateString(),
        ]);

        Avaliacao::create([
            'aluno_id' => $aluno2->id,
            'professor_id' => $prof2->id,
            'passe' => 6,
            'chute' => 8,
            'dominio' => 7,
            'condicionamento' => 9,
            'disciplina' => 8,
            'parecer' => 'Lucas tem grande condicionamento físico e força física. Estamos aprimorando o passe de curta distância.',
            'date' => Carbon::now()->subDays(5)->toDateString(),
        ]);
        
        // Mateus (Brother of Pedro)
        Avaliacao::create([
            'aluno_id' => $aluno4->id,
            'professor_id' => $prof2->id,
            'passe' => 9,
            'chute' => 9,
            'dominio' => 8,
            'condicionamento' => 9,
            'disciplina' => 10,
            'parecer' => 'Mateus é um líder nato em quadra, excelente visão de jogo.',
            'date' => Carbon::now()->subDays(10)->toDateString(),
        ]);
    }
}
