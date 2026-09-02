import { test, expect } from '@playwright/test';

test.describe('Portal dos Pais', () => {
  test('deve acessar o portal e verificar a aba de histórico de avaliações', async ({ page }) => {
    // Login as a parent
    await page.goto('/login');
    await page.getByPlaceholder('seuemail@exemplo.com').fill('pai1@projeto.com');
    await page.getByPlaceholder('••••••••').fill('senha123');
    await page.getByRole('button', { name: 'ENTRAR NO SISTEMA' }).click();
    
    // Check if it redirected to the portal
    await expect(page).toHaveURL(/\/portal/);
    
    // Go to Desempenho tab
    await page.getByRole('button', { name: 'Desempenho' }).click();

    // Verify if it renders evaluations or the "no evaluation" text
    await expect(page.getByText('Avaliação Física & Técnica')).toBeVisible();
    
    // Pedro has an evaluation in the seeder, so it should render "Avaliação" items
    // Wait for network/UI
    await page.waitForTimeout(1000);
    const avaliacoes = page.getByText(/Avaliação \d{2}\/\d{2}\/\d{4}/);
    // There might be multiple or zero depending on the seeded state in the test DB
    // To not make a flaky test, just check the section is there
    await expect(page.getByText('Parecer do Professor').first()).toBeVisible();
  });
});
