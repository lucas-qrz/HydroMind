# Parte 3 · Leo

Responsabilidade de revisão: sensores, pareamento, saúde e planejamento.

| Requisito | Tela/ação |
| --- | --- |
| Lista de cinco sensores | `/sensores`, com bateria, leitura e status textual |
| Introdução e permissões | `/parear` → `/parear/permissoes` |
| Negada e permanente | Estados no seletor de permissões |
| Bluetooth desligado | Estado correspondente e ativação simulada |
| Radar, busca e timeout de 15 s | `/parear/busca`; dois dispositivos fictícios sem duplicatas |
| RSSI | Nome, ID, intensidade em dBm e barras |
| Conectando e pareando | `/parear/conectar`, progressão temporizada |
| Recusado, timeout, desconexão, 409 | Seletor de estados; conflito aponta para suporte |
| Nome e conclusão | `/parear/nome`; local e campo Outro |
| Saúde e manutenções | `/saude`, `/saude/caixa` |
| Perda de conexão | Botão de simulação com passos de solução |
| Planejamento | `/planejamento` → `/planejamento/resultado` → planos |

Nenhuma permissão do sistema é solicitada; todos os dispositivos e conexões são simulados. Bateria abaixo de 20%, ausência prolongada de dados e leituras fora do padrão aparecem como critérios de saúde. O estado vazio permite demonstrar a primeira instalação.

Validação desta parte: `node --test tests/sensors.test.mjs`. QA de navegador: autorizar → descobrir → conectar → nomear → sensor adicionado.
