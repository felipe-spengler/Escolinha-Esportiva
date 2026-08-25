<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Campeonato;

class CampeonatosTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_pode_criar_campeonato()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/admin/campeonatos', [
            'nome' => 'Copa de Verão',
            'data_inicio' => '2026-01-01',
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('campeonatos', [
            'nome' => 'Copa de Verão'
        ]);
    }
}
