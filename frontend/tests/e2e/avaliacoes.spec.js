import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('seuemail@exemplo.com').fill('admin@admin.com');
  await page.getByPlaceholder('••••••••').fill('senha123');
  await page.getByRole('button', { name: 'ENTRAR NO SISTEMA' }).click();
  await expect(page).toHaveURL(/\/admin/);
});

test.describe('Ficha de Avaliação (Admin)', () => {
  test('deve conseguir acessar a aba de avaliações e ver o histórico', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.locator('button.lg\\:hidden').click();
    }
    await page.getByRole('button', { name: '⭐ Ficha de Avaliação' }).click();
    
    // Deve ver o título
    await expect(page.getByText('Histórico de Avaliações Técnicas')).toBeVisible();
    
    // Deve exibir o botão de Nova Avaliação
    await expect(page.getByRole('button', { name: '+ Nova Avaliação' })).toBeVisible();
  });

  test('deve abrir o modal ao clicar em Nova Avaliação', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.locator('button.lg\\:hidden').click();
    }
    await page.getByRole('button', { name: '⭐ Ficha de Avaliação' }).click();
    await page.getByRole('button', { name: '+ Nova Avaliação' }).click();
    
    // Checks for elements inside the modal
    await expect(page.getByText('Data da Avaliação').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Registrar Avaliação' })).toBeVisible();
  });
});
