import { test, expect } from '@playwright/test';

// Utilizando hooks para fazer o login antes de cada teste no dashboard
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('admin@email.com').fill('admin@admin.com');
  await page.getByPlaceholder('••••••••').fill('senha123');
  await page.getByRole('button', { name: 'ENTRAR NO SISTEMA' }).click();
  await expect(page).toHaveURL(/\/admin/);
});

test.describe('Dashboard e Visualização de Dados', () => {
  test('deve carregar os resumos numéricos e gráficos de pizza', async ({ page }) => {
    // Verifica se os cards de resumo existem e estão visíveis
    await expect(page.getByText('Total de Alunos')).toBeVisible();
    await expect(page.getByText('Turmas Ativas')).toBeVisible();
    await expect(page.getByText('Inadimplência')).toBeVisible();
    
    // Verifica se a tabela de fluxo de caixa carregou (busca por colunas comuns)
    await expect(page.getByText('Últimas Movimentações')).toBeVisible();
    await expect(page.getByText('Descrição', { exact: true })).toBeVisible();
  });

  test('deve conseguir navegar pelas abas laterais (Alunos, Turmas)', async ({ page }) => {
    // Clica na aba de Turmas no menu lateral
    await page.getByRole('button', { name: 'Turmas' }).click();
    await expect(page.getByRole('heading', { name: 'Gerenciamento de Turmas' })).toBeVisible();

    // Clica na aba de Alunos no menu lateral
    await page.getByRole('button', { name: 'Alunos' }).click();
    await expect(page.getByRole('heading', { name: 'Gerenciamento de Alunos' })).toBeVisible();
    
    // Verifica se existe o botão de Adicionar Aluno (indicando que a aba carregou o componente)
    await expect(page.getByRole('button', { name: 'Adicionar Aluno' })).toBeVisible();
  });
});
