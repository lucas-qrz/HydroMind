# Parte 2 · Caio

Responsabilidade de revisão: dashboard, dados em tempo real e guia de tokens.

| Requisito | Tela/ação |
| --- | --- |
| Dashboard mobile/tablet/desktop | `/inicio`; sidebar e painel lateral no desktop |
| Sensores, status e modo | Chips, modo individual/agregado |
| Janelas de tempo | 5 min, 1 h, 24 h, com séries demonstrativas distintas |
| Vazão e limite | SVG com faixas normal/elevada e linha tracejada |
| Tooltip e teclado | Pontos do SVG com `title` e foco por Tab |
| Métricas e previsão | 412 L, 8,2 m³, tarifa e custo derivados; previsão 11,4 m³ |
| Cinco estados mais alerta ativo | Seletor do rodapé; `?estado=active` |
| Detalhe e ajustes | `/sensor/banheiro`; renomear e ajustar limite em modal |
| Saúde e bateria | Links dos cinco sensores |
| Contraste | `/tokens`, medido pela fórmula de luminância relativa |

“Ao vivo” representa uma simulação local, com série rotacionada a cada cinco segundos. Não há leitura IoT ou modelo de previsão real. Os indicadores usam as cores do briefing e os textos usam pares de maior contraste quando necessário.

Validação desta parte: `node --test tests/dashboard.test.mjs`. QA de navegador: resolução 1440, 768 e 390 px, configuração persistida do limite e capturas do dashboard.
