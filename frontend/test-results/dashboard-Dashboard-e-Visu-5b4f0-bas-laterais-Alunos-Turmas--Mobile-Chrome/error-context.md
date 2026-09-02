# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.js >> Dashboard e Visualização de Dados >> deve conseguir navegar pelas abas laterais (Alunos, Turmas)
- Location: tests\e2e\dashboard.spec.js:20:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '🏫 Turmas' })
    - locator resolved to <button class="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center text-slate-400 hover:text-slate-200 hover:bg-slate-800/40">🏫 Turmas</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - element is outside of the viewport
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - element is outside of the viewport
    - retrying click action
      - waiting 100ms
    59 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - element is outside of the viewport
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling

```

# Page snapshot

```yaml
- main [ref=e4]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - button [ref=e8]
        - heading "ARENA - GESTÃO ESPORTIVA" [level=1] [ref=e11]
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: Diretor Felipe
          - generic [ref=e15]: Diretor Geral
        - button "Sair" [ref=e16]
    - generic [ref=e17]:
      - complementary [ref=e18]:
        - button "📊 Dashboard" [ref=e19]
        - button "📝 Diário de Classe" [ref=e20]
        - button "⭐ Ficha de Avaliação" [ref=e21]
        - button "🏃 Gerenciar Alunos" [ref=e22]
        - button "👥 Pais / Responsáveis" [ref=e23]
        - button "🏫 Turmas" [ref=e24]
        - button "👔 Professores" [ref=e25]
        - button "💰 Mensalidades" [ref=e26]
        - button "🛒 Loja / PDV" [ref=e27]
        - button "📉 Fluxo de Caixa" [ref=e28]
      - main [ref=e29]:
        - generic [ref=e30]:
          - generic [ref=e31]:
            - generic [ref=e32]:
              - generic [ref=e33]: RUN
              - text: Alunos Ativos
              - generic [ref=e34]: "31"
            - generic [ref=e35]:
              - generic [ref=e36]: DEB
              - text: Inadimplentes no Mês
              - generic [ref=e37]: "58"
            - generic [ref=e38]:
              - generic [ref=e39]: CAI
              - text: Finanças do Mês
              - generic [ref=e40]: "Rec: R$ 3510.00"
              - generic [ref=e41]: "Desp: R$ 0.00"
          - generic [ref=e42]:
            - generic [ref=e43]:
              - heading "Fluxo Financeiro (Histórico)" [level=3] [ref=e44]
              - generic [ref=e45]:
                - generic [ref=e46]:
                  - generic [ref=e47]:
                    - 'generic "Receitas: R$ 0.00"'
                    - 'generic "Despesas: R$ 0.00"'
                  - generic [ref=e48]: Apr
                - generic [ref=e49]:
                  - generic [ref=e50]:
                    - 'generic "Receitas: R$ 0.00"'
                    - 'generic "Despesas: R$ 0.00"'
                  - generic [ref=e51]: May
                - generic [ref=e52]:
                  - generic [ref=e53]:
                    - 'generic "Receitas: R$ 0.00"'
                    - 'generic "Despesas: R$ 0.00"'
                  - generic [ref=e54]: Jun
                - generic [ref=e55]:
                  - generic [ref=e56]:
                    - 'generic "Receitas: R$ 0.00"'
                    - 'generic "Despesas: R$ 0.00"'
                  - generic [ref=e57]: Jul
                - generic [ref=e58]:
                  - generic [ref=e59]:
                    - 'generic "Receitas: R$ 205.00" [ref=e60]'
                    - 'generic "Despesas: R$ 750.00" [ref=e61]'
                  - generic [ref=e62]: Aug
                - generic [ref=e63]:
                  - generic [ref=e64]:
                    - 'generic "Receitas: R$ 3510.00" [ref=e65]'
                    - 'generic "Despesas: R$ 0.00"'
                  - generic [ref=e66]: Sep
              - generic [ref=e67]:
                - generic [ref=e68]: Receitas
                - generic [ref=e70]: Despesas
            - generic [ref=e72]:
              - generic [ref=e73]:
                - heading "🎈 Aniversariantes do Mês" [level=3] [ref=e74]
                - generic [ref=e75]:
                  - generic [ref=e76]:
                    - generic [ref=e77]: Ziraldo Leon
                    - generic [ref=e78]: 6 de setembro
                  - generic [ref=e79]:
                    - generic [ref=e80]: Adriana Burgos
                    - generic [ref=e81]: 31 de agosto
              - generic [ref=e82]:
                - generic [ref=e83]:
                  - heading "Aniversariantes do Dia:" [level=4] [ref=e84]
                  - paragraph [ref=e85]: Nenhum hoje.
                - generic [ref=e86]: 🍰
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
  13 |     await expect(page.getByText('Alunos Ativos')).toBeVisible();
  14 |     await expect(page.getByText('Inadimplentes no Mês')).toBeVisible();
  15 |     await expect(page.getByText('Finanças do Mês')).toBeVisible();
  16 |     
  17 |     await expect(page.getByText('Fluxo Financeiro (Histórico)')).toBeVisible();
  18 |   });
  19 | 
  20 |   test('deve conseguir navegar pelas abas laterais (Alunos, Turmas)', async ({ page }) => {
> 21 |     await page.getByRole('button', { name: '🏫 Turmas' }).click();
     |                                                           ^ Error: locator.click: Test timeout of 30000ms exceeded.
  22 |     
  23 |     await page.getByRole('button', { name: '🏃 Gerenciar Alunos' }).click();
  24 |   });
  25 | });
  26 | 
```