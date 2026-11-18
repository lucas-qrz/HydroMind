# Validação da entrega

Verificação em Windows, Node.js 24.20.0. A aplicação não depende de instalação de pacotes.

## Concluído

- **15 testes automatizados aprovados** com `node --test tests/*.test.mjs`.
- Validação de contato, força de senha e limite de três tentativas do código; reenvio permite concluir a verificação.
- Planejamento de pontos e adição de sensor com identificador único.
- Falha do registro não altera seu estado; confirmação bem-sucedida resolve o alerta demonstrativo.
- Histórico reconcilia os cinco sensores com 412 L no dia e 8,2 m³ no mês. Agregações preservam o total.
- Comparação separa dia sem leitura de consumo zero; percentual fica indefinido quando não há referência disponível.
- CSV trata decimais, UTF-8, aspas e texto que poderia virar fórmula em planilhas.
- Pares de texto de status e botão primário atendem à razão de contraste AA testada.
- Desconto dos planos, cartão demonstrativo sem persistência de seus campos e ciclo de visita foram verificados.
- Todas as **61 rotas** foram renderizadas como HTML pelos módulos nos estados comuns e específicos. Destinos dos links foram comparados com as rotas cadastradas.
- Servidor HTTP entrega HTML/JS/CSS/SVG e bloqueia acesso aos arquivos de testes, documentação e configuração.

`node scripts/check.mjs` também confere sintaxe JavaScript, regra de fonte mínima de 12 px nos estilos e atribuição exclusiva de cada arquivo a um dos seis responsáveis. `node scripts/build.mjs` prepara os arquivos estáticos em `dist/`.

## Limite de verificação

A QA visual e os cliques em navegador **não foram concluídos nesta sessão**. A instalação de Playwright foi bloqueada pela rede; o Edge instalado não disponibilizou uma sessão DevTools controlável no ambiente. Nenhuma captura ou aprovação visual é afirmada nesta entrega.

O script opcional `node scripts/browser-check.mjs` está preparado para execução local fora dessa restrição. Ele tenta percorrer as 61 rotas em 1440, 768 e 390 px, detecta transbordamento horizontal e erros de execução e exercita cadastro, pareamento, registro, tarifa, cartão, visita e chamado. Seus resultados só são válidos após uma execução bem-sucedida; a presença do script não significa que esses testes passaram.

Antes de apresentar, abra a aplicação e revise os fluxos dos seis integrantes, a responsividade, os gráficos ao toque/teclado, o tema escuro, o alto contraste e a impressão do relatório. Não houve auditoria completa com leitor de tela ou certificação WCAG.

## Natureza do protótipo

Integrações externas, dispositivos, IA, pagamentos e atendimento são demonstrações. Para produção seriam necessários backend, autenticação e autorização reais, integração e calibração dos sensores, serviços externos, infraestrutura e testes de segurança e acessibilidade. A entrega nativa de frames Figma permanece uma etapa distinta, descrita em `HANDOFF.md`.
