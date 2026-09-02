import { test, expect } from '@playwright/test';

test.describe('Autenticação de Administrador', () => {
  test('deve conseguir fazer login com credenciais validas', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page).toHaveTitle(/Escolinha Esportiva/);
    await expect(page.getByText('Arena Escolinha')).toBeVisible();

    await page.getByPlaceholder('seuemail@exemplo.com').fill('admin@admin.com');
    await page.getByPlaceholder('••••••••').fill('senha123');
    await page.getByRole('button', { name: 'ENTRAR NO SISTEMA' }).click();

    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByText('ARENA - GESTÃO ESPORTIVA')).toBeVisible();
  });

  test('deve exibir erro com credenciais invalidas', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByPlaceholder('seuemail@exemplo.com').fill('errado@admin.com');
    await page.getByPlaceholder('••••••••').fill('senhaerrada');
    await page.getByRole('button', { name: 'ENTRAR NO SISTEMA' }).click();

    await expect(page.getByText('Credenciais inválidas')).toBeVisible();
  });
});
