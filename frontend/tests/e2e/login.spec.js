import { test, expect } from '@playwright/test';

test.describe('Autenticação de Administrador', () => {
  test('deve conseguir fazer login com credenciais validas', async ({ page }) => {
    // Acessa a página de login
    await page.goto('/login');
    
    // Verifica se o título da página está presente
    await expect(page).toHaveTitle(/Escolinha Esportiva/);
    await expect(page.getByText('Arena Escolinha')).toBeVisible();

    // Preenche o formulário
    await page.getByPlaceholder('admin@email.com').fill('admin@admin.com');
    await page.getByPlaceholder('••••••••').fill('senha123');

    // Clica no botão de login
    await page.getByRole('button', { name: 'ENTRAR NO SISTEMA' }).click();

    // Verifica se foi redirecionado para o dashboard e o layout carregou
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByText('Dashboard Administrativo')).toBeVisible();
  });

  test('deve exibir erro com credenciais invalidas', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByPlaceholder('admin@email.com').fill('errado@admin.com');
    await page.getByPlaceholder('••••••••').fill('senhaerrada');
    await page.getByRole('button', { name: 'ENTRAR NO SISTEMA' }).click();

    // Verifica se a mensagem de erro (Credenciais inválidas) apareceu
    await expect(page.getByText('Credenciais inválidas')).toBeVisible();
  });
});
