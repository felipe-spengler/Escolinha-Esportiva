import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('seuemail@exemplo.com').fill('admin@admin.com');
  await page.getByPlaceholder('••••••••').fill('senha123');
  await page.getByRole('button', { name: 'ENTRAR NO SISTEMA' }).click();
  await expect(page).toHaveURL(/\/admin/);
});

test.describe('Dashboard e Visualização de Dados', () => {
  test('deve carregar os resumos numéricos e gráficos de pizza', async ({ page }) => {
    await expect(page.getByText('Alunos Ativos')).toBeVisible();
    await expect(page.getByText('Inadimplentes no Mês')).toBeVisible();
    await expect(page.getByText('Finanças do Mês')).toBeVisible();
    
    await expect(page.getByText('Fluxo Financeiro (Histórico)')).toBeVisible();
  });

  test('deve conseguir navegar pelas abas laterais (Alunos, Turmas)', async ({ page }) => {
    await page.getByRole('button', { name: '🏫 Turmas' }).click();
    
    await page.getByRole('button', { name: '🏃 Gerenciar Alunos' }).click();
  });
});
