# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.js >> Dashboard e Visualização de Dados >> deve carregar os resumos numéricos e gráficos de pizza
- Location: tests\e2e\dashboard.spec.js:12:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Alunos Ativos')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Alunos Ativos')

```

```yaml
- main:
  - text: ⚽
  - heading "ARENA - GESTÃO ESPORTIVA" [level=1]
  - text: Diretor Felipe Diretor Geral
  - button "Sair"
  - complementary:
    - button "📊 Dashboard"
    - button "📝 Diário de Classe"
    - button "⭐ Ficha de Avaliação"
    - button "🏃 Gerenciar Alunos"
    - button "👥 Pais / Responsáveis"
    - button "🏫 Turmas"
    - button "👔 Professores"
    - button "💰 Mensalidades"
    - button "🛒 Loja / PDV"
    - button "📉 Fluxo de Caixa"
  - main
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.beforeEach(async ({ page }) => {
  4  |   await page.goto('/login');
  5  |   await page.getByPlaceholder('seuemail@exemplo.com').fill('admin@admin.com');
  6  |   await page.getByPlaceholder('••••••••').fill('senha123');
  7  |   await page.getByRole('button', { name: 'ENTRAR NO SISTEMA' }).click();
  8  |   await expect(page).toHaveURL(/\/admin/);
  9  | });
  10 | 
  11 | test.describe('Dashboard e Visualização de Dados', () => {
  12 |   test('deve carregar os resumos numéricos e gráficos de pizza', async ({ page }) => {
> 13 |     await expect(page.getByText('Alunos Ativos')).toBeVisible();
     |                                                   ^ Error: expect(locator).toBeVisible() failed
  14 |     await expect(page.getByText('Inadimplentes no Mês')).toBeVisible();
  15 |     await expect(page.getByText('Finanças do Mês')).toBeVisible();
  16 |     
  17 |     await expect(page.getByText('Fluxo Financeiro (Histórico)')).toBeVisible();
  18 |   });
  19 | 
  20 |   test('deve conseguir navegar pelas abas laterais (Alunos, Turmas)', async ({ page }) => {
  21 |     await page.getByRole('button', { name: '🏫 Turmas' }).click();
  22 |     
  23 |     await page.getByRole('button', { name: '🏃 Gerenciar Alunos' }).click();
  24 |   });
  25 | });
  26 | 
```