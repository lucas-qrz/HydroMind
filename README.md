# Hydro Mind · Água Alerta

Protótipo acadêmico navegável feito a partir dos seis prompts do grupo. Interface em português do Brasil, dados fictícios de Marina Souza e identidade visual do briefing.

## Executar

Requisito: **Node.js 22 ou superior**. Não precisa instalar dependências.

```powershell
cd E:\Geral\Faculdade\HydroMind
node server.mjs
```

Abra **http://localhost:4173**. No Windows, também é possível abrir `iniciar.cmd`. Para parar o servidor, pressione Ctrl+C. Se a porta estiver ocupada, use `$env:PORT=4174` antes de iniciar.

O dashboard abre diretamente para facilitar a apresentação. O fluxo inicial completo começa em **http://localhost:4173/#/splash**. Todas as telas ficam em **http://localhost:4173/#/prototipo**.

Login demonstrativo: `marina.souza@email.com` / `Hydro@2026`. Código de verificação: `123456`. Um cadastro novo modifica o perfil demonstrativo; o login também aceita o e-mail do perfil atual. A senha demonstrativa permanece a mesma.

## As seis partes

| Parte | Responsável pela revisão e integração | Entrega |
| --- | --- | --- |
| 1 | Lucas | Conta, perfil, configurações e base compartilhada |
| 2 | Leo | Dashboard e monitoramento |
| 3 | Murillo | Sensores, pareamento e manutenção |
| 4 | João | Alertas, notificações e metas |
| 5 | Diego | Economia, histórico, dicas e condomínio |
| 6 | Caio | Planos, pagamentos, instalação e suporte |

Veja [DIVISAO_COMMITS.md](DIVISAO_COMMITS.md) para os arquivos exatos, ordem dos commits e como preparar cada parte. Os nomes representam a distribuição de responsabilidades para revisão e integração; não são autores Git criados automaticamente.

## O que é esta entrega

Uma aplicação estática com HTML, CSS e JavaScript modular, sem framework e sem bibliotecas de runtime. Há mais de 60 rotas, três tamanhos de referência, componentes reutilizáveis e estados demonstráveis. As alterações ficam no `localStorage` deste navegador. A opção “Mapa de telas → Restaurar dados de demonstração” apaga as alterações locais.

Esta entrega **não é um arquivo nativo do Figma**. As dimensões, tokens, componentes HM/, nomes de frames e fluxos estão documentados em [docs/HANDOFF.md](docs/HANDOFF.md) para reprodução no Figma. Auto Layout, Variables/Styles e conexões nativas do Prototype precisam ser montados no Figma se forem exigidos pela professora.

Sensores BLE/Wi-Fi, IA, autenticação, envios de código/link, convites, push, registro remoto, pagamentos, CEP, profissionais e atendentes são **simulações claramente identificadas**. Não há backend, cobrança, atendimento, controle de água ou envio de mensagens reais. O player é uma sequência ilustrada com controles e transcrição, sem vídeo técnico externo.

CSV é um arquivo real, compatível com planilhas. A opção PDF abre um relatório e usa “Imprimir → Salvar como PDF” do navegador. O envio ao síndico orienta o compartilhamento manual; nenhum envio externo ocorre.

As fontes Inter e Noto Serif são carregadas opcionalmente do Google Fonts. Sem internet, usam Arial e Georgia como alternativas e o restante da aplicação funciona normalmente.

## Conferir

```powershell
node --test tests/*.test.mjs
node scripts/check.mjs
node scripts/build.mjs
```

O build copia a aplicação estática para `dist/`. A pasta é gerada e não entra nos commits. Não abra o `index.html` com `file://`: os módulos devem ser servidos por HTTP.

QA de navegador opcional, usando o Microsoft Edge instalado no Windows, sem baixar ferramentas:

```powershell
node scripts/browser-check.mjs
```

Se necessário, defina `$env:EDGE_PATH` com o caminho do `msedge.exe`. Essa rotina usa a porta local 9237 e gera capturas e resultados em `artifacts/`, que não entram no Git. Veja [docs/VALIDACAO.md](docs/VALIDACAO.md) para a validação desta entrega.

O [roteiro de apresentação](docs/ROTEIRO_APRESENTACAO.md) sugere a demonstração para os seis integrantes. Os [prompts originais](docs/requisitos-originais.txt) e os seis guias em `docs/partes/` permitem conferir o escopo.
