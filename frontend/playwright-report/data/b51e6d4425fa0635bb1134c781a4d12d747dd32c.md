# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.js >> Autenticação de Administrador >> deve conseguir fazer login com credenciais validas
- Location: tests\e2e\login.spec.js:4:3

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /Escolinha Esportiva/
Received string:  "Arena - Gestão Esportiva"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    13 × locator resolved to <html lang="en">…</html>
       - unexpected value "Arena - Gestão Esportiva"

```

```yaml
- main:
  - text: ⚽
  - heading "Arena Escolinha" [level=2]
  - paragraph: Entre com suas credenciais para acessar o portal
  - text: E-mail
  - textbox "seuemail@exemplo.com"
  - text: Senha
  - textbox "••••••••"
  - button "Entrar no Sistema"
  - text: Escolinha de Futebol • Painel de Controle v1.0
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Autenticação de Administrador', () => {
  4  |   test('deve conseguir fazer login com credenciais validas', async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     
> 7  |     await expect(page).toHaveTitle(/Arena - Gestão Esportiva/);
     |                        ^ Error: expect(page).toHaveTitle(expected) failed
  8  |     await expect(page.getByText('Arena Escolinha')).toBeVisible();
  9  | 
  10 |     await page.getByPlaceholder('seuemail@exemplo.com').fill('admin@admin.com');
  11 |     await page.getByPlaceholder('••••••••').fill('senha123');
  12 |     await page.getByRole('button', { name: 'ENTRAR NO SISTEMA' }).click();
  13 | 
  14 |     await expect(page).toHaveURL(/\/admin/);
  15 |     await expect(page.getByText('ARENA - GESTÃO ESPORTIVA')).toBeVisible();
  16 |   });
  17 | 
  18 |   test('deve exibir erro com credenciais invalidas', async ({ page }) => {
  19 |     await page.goto('/login');
  20 |     
  21 |     await page.getByPlaceholder('seuemail@exemplo.com').fill('errado@admin.com');
  22 |     await page.getByPlaceholder('••••••••').fill('senhaerrada');
  23 |     await page.getByRole('button', { name: 'ENTRAR NO SISTEMA' }).click();
  24 | 
  25 |     await expect(page.getByText('Credenciais inválidas')).toBeVisible();
  26 |   });
  27 | });
  28 | 
```