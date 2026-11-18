# Handoff visual e navegação

## Referências

- Mobile: 390 × 844; tablet: 768 px; desktop: 1440 × 1024.
- Sidebar no desktop; sidebar compacta no tablet; cinco abas inferiores no mobile: Início, Sensores, Alertas, Economia, Mais.
- Navegação por hash: cada tela tem URL própria e o botão Voltar do navegador funciona.
- O rodapé oferece “Mapa de telas” e seletor de estados. Os exemplos não dependem de falhas reais de rede.
- A data de referência dos dados é **17/11/2026**. O suporte calcula “Aberto agora” com o relógio real em America/Sao_Paulo, das 9h às 18h em dias úteis.

## Tokens

| Token Figma sugerido | Valor | Uso |
| --- | --- | --- |
| HM/Color/Navy | #0B1F3F | Texto e sidebar |
| HM/Color/Primary | #1D7396 | Ações principais |
| HM/Color/Cyan | #35C8E0 | Dados e acentos |
| HM/Color/Background | #F3F8FB | Fundo |
| HM/Color/Surface | #FFFFFF | Cards |
| HM/Color/Muted | #5B7089 | Texto secundário |
| HM/Status/Normal | #2E8B57 | Indicador normal |
| HM/Status/Elevado | #E8A33D | Indicador de atenção |
| HM/Status/Critico | #C0392B | Alerta crítico |
| HM/Text/Normal | #246C44 | Texto normal com contraste |
| HM/Text/Elevado | #83520A | Texto de atenção com contraste |

O guia interativo em `#/tokens` mede as razões de contraste sobre #F3F8FB. Verde e âmbar originais não são tratados como texto pequeno aprovado em AA: são acentos, acompanhados de rótulos e ícones. Isso evita uma comprovação incorreta. O contraste é uma parte da acessibilidade; não representa uma certificação WCAG completa.

Títulos: Noto Serif, peso 700. Interface: Inter, pesos 400, 500 e 600. Dados: Inter 600. Texto mínimo: 12 px. Cards: 16 px de raio. Grade de referência: 8 px, com subdivisões para bordas e controles. Alvos interativos: pelo menos 44 px.

## Biblioteca de componentes

| Nome sugerido no Figma | Código |
| --- | --- |
| HM/Button/Primary, Secondary, Danger | `btn`, `link` e `.button` |
| HM/Card/Metric | `stat` |
| HM/Card/Base | `card` |
| HM/Input/Text, Select, Password | `field`, `select` e componente de senha |
| HM/Switch | `toggle` |
| HM/Badge/Status | `badge` |
| HM/Alert/Inline | `notice` |
| HM/Chart/Flow | `chart` |
| HM/Chart/Comparison | `bars` |
| HM/Sensor/Row | `sensorRow` |
| HM/Toast | `toast` em `app.js` |
| HM/Dialog | `modal` em `app.js` |
| HM/Navigation/Sidebar, Bottom | Layout em `app.js` |

## Convenção de frames

Use `[Parte]-[Fluxo]-[Estado]`. Exemplos:

- P1-Cadastro-Sucesso, P1-Cadastro-Conflito409, P1-Verificacao-Incorreto.
- P2-Dashboard-Sucesso, P2-Dashboard-Carregando, P2-Dashboard-Vazio, P2-Dashboard-Erro, P2-Dashboard-Offline, P2-Dashboard-AlertaAtivo.
- P3-Pareamento-PermissaoNegada, P3-Pareamento-TempoEsgotado, P3-Pareamento-Conflito409.
- P4-Registro-Confirmacao, P4-Registro-Processando, P4-Registro-Falha, P4-Alerta-Resolvido.
- P5-Historico-Sucesso, P5-Comparacao-SemDados, P5-Exportacao-Pronto.
- P6-Pagamento-PixExpirado, P6-Pagamento-Aprovado, P6-Visita-Reagendada.

No navegador, as variações comuns usam `?estado=loading`, `empty`, `error` ou `offline`. Estados específicos aparecem no mesmo seletor. Modais e validações são abertos pelas ações de cada tela. Um exemplo é `#/inicio?estado=active`.

Para handoff nativo, crie frames nesses tamanhos, transforme os componentes acima em componentes Figma com Auto Layout, registre tokens em Variables/Styles e conecte as transições descritas nos guias das partes. O código não cria esses objetos na conta Figma.

## Coerência e limites do briefing

- Hoje: 412 L, soma dos cinco sensores; novembro parcial: 8,2 m³; tarifa inicial: R$ 8,50/m³; custo: R$ 69,70.
- A previsão de 11,4 m³ e a economia acumulada de R$ 148,20 são exemplos fixos do briefing, não resultados de uma IA treinada. O custo da previsão acompanha a tarifa editada.
- Histórico: outubro de 2026 soma 9,32 m³; novembro até dia 17 soma 8,2 m³. Sem leituras depois dessa data. Comparações mantêm dias sem leitura como lacunas.
- O texto de alerta usa 0,31 L/min conforme o exemplo. Esse valor está abaixo da faixa nominal de 1 a 30 L/min informada para o HM-FLOW-01. A demonstração preserva o briefing; uma implementação física exigiria validar a capacidade de detectar esse fluxo com o fabricante.
- O limite de vazamento contínuo no gráfico do evento é ilustrativo e separado do limite de pico configurável do sensor.
- O consentimento e a página de privacidade são modelos de interface acadêmica; não substituem documentos e avaliação de um serviço em produção.
