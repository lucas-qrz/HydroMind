# Divisão dos arquivos em seis commits

A ordem segue os seis prompts: **Lucas, Caio, Leo, Bazinga, JP e DG**. Cada arquivo pertence a uma única parte. `node scripts/check.mjs` verifica a distribuição.

Os nomes representam responsabilidades de revisão e integração. Cada integrante deve revisar, entender e testar sua parte e fazer o próprio commit com sua conta Git. Nenhum commit foi feito automaticamente.

## Preparar o repositório

Use um repositório cuja raiz seja HydroMind. Se ainda não existe, Lucas pode iniciar `git init` nessa pasta e conectar o remoto do grupo. Se já existe, copie esta entrega para a raiz do clone e preserve a pasta `.git`. Não adicione Faculdade inteira.

Todos devem ter a entrega completa no clone local antes de usar o script. Os arquivos dos outros integrantes podem ficar sem stage. Cada um sincroniza os commits anteriores com `git pull --ff-only` antes de preparar a própria parte. O script não muda autoria, não faz commit e não publica. Se o repositório tiver arquivos extras, inclua-os conscientemente no manifesto antes da conferência.

A base importa os seis módulos; por isso um clone com apenas os primeiros commits ainda pode não executar até receber as partes restantes. A entrega completa funciona localmente desde o início. A divisão prioriza responsabilidade exclusiva por arquivos.

## Fluxo de cada integrante

1. Revise os arquivos da sua parte e seu guia em `docs/partes/`.
2. Teste as telas e execute os testes.
3. Rode o comando de preparação abaixo.
4. Confira `git diff --cached` e `git status`.
5. Faça seu commit e publique com sua própria conta.

Não use `git add .` nestes seis commits. O script recusa misturar arquivos de outra parte que já estejam no stage; revise o stage antes de continuar.

## 1. Lucas(lucas-qrz) — Conta, perfil, configurações e base compartilhada

**27 arquivos:**

- `.gitignore`
- `DIVISAO_COMMITS.md`
- `README.md`
- `assets/mark.svg`
- `docs/HANDOFF.md`
- `docs/ROTEIRO_APRESENTACAO.md`
- `docs/VALIDACAO.md`
- `docs/divisao-commits.json`
- `docs/partes/1-Lucas.md`
- `docs/requisitos-originais.txt`
- `index.html`
- `iniciar.cmd`
- `package.json`
- `scripts/browser-check.mjs`
- `scripts/build.mjs`
- `scripts/check.mjs`
- `scripts/ownership.mjs`
- `scripts/preparar-commit.mjs`
- `server.mjs`
- `src/app.js`
- `src/core/logic.js`
- `src/core/store.js`
- `src/core/ui.js`
- `src/modules/account.js`
- `src/styles.css`
- `tests/account.test.mjs`
- `tests/integration.test.mjs`

Preparar e revisar:

```powershell
node scripts/preparar-commit.mjs Lucas
git diff --cached
git commit -m "feat(conta): criar base do app, conta e configuracoes"
```

## 2. Leo(Mennzes) — Dashboard e monitoramento em tempo real

**4 arquivos:**

- `docs/partes/2-Caio.md`
- `src/modules/dashboard.css`
- `src/modules/dashboard.js`
- `tests/dashboard.test.mjs`

Preparar e revisar:

```powershell
node scripts/preparar-commit.mjs Caio
git diff --cached
git commit -m "feat(dashboard): adicionar monitoramento e detalhe dos sensores"
```

## 3. Murillo(Mbarrosoz) — Sensores, pareamento e manutenção

**4 arquivos:**

- `docs/partes/3-Leo.md`
- `src/modules/sensors.css`
- `src/modules/sensors.js`
- `tests/sensors.test.mjs`

Preparar e revisar:

```powershell
node scripts/preparar-commit.mjs Leo
git diff --cached
git commit -m "feat(sensores): implementar pareamento, saude e planejamento"
```

## 4. João(baldiceirajp) — Alertas, notificações e metas

**4 arquivos:**

- `docs/partes/4-Bazinga.md`
- `src/modules/alerts.css`
- `src/modules/alerts.js`
- `tests/alerts.test.mjs`

Preparar e revisar:

```powershell
node scripts/preparar-commit.mjs Bazinga
git diff --cached
git commit -m "feat(alertas): adicionar alertas, notificacoes e metas"
```

## 5. Diego(dgnotfound) — Economia, histórico, dicas e condomínio

**5 arquivos:**

- `docs/partes/5-JP.md`
- `src/modules/economy-data.js`
- `src/modules/economy.css`
- `src/modules/economy.js`
- `tests/economy.test.mjs`

Preparar e revisar:

```powershell
node scripts/preparar-commit.mjs JP
git diff --cached
git commit -m "feat(economia): implementar historico, comparacoes e exportacao"
```

## 6. Caio(Moraes-Caio) — Planos, pagamento, instalação e suporte

**4 arquivos:**

- `docs/partes/6-DG.md`
- `src/modules/services.css`
- `src/modules/services.js`
- `tests/services.test.mjs`

Preparar e revisar:

```powershell
node scripts/preparar-commit.mjs DG
git diff --cached
git commit -m "feat(servicos): adicionar planos, instalacao e atendimento"
```

## Conferência final

Depois dos seis commits:

```powershell
node scripts/check.mjs
node --test tests/*.test.mjs
node scripts/build.mjs
git log --oneline --format="%h %an %s" -6
```

`dist/`, `artifacts/`, `node_modules/` e `.env` ficam fora do Git. A lista verificável está em `docs/divisao-commits.json`. Se adicionar arquivos depois, atualize a parte correspondente nesse manifesto.
