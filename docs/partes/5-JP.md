# Parte 5 · JP

Responsabilidade de revisão: economia, histórico, comparação, dicas e condomínio.

| Requisito | Tela/ação |
| --- | --- |
| Retorno acumulado e gasto | `/economia`; R$ 148,20 fictícios; gasto acompanha tarifa |
| Tarifa com vírgula | `/tarifa`; erro para zero, salvamento temporizado e toast |
| Referência de três contas | `/referencia`; prévia da média em tempo real |
| Histórico e agregação | `/historico`; dia/semana/mês, datas e sensor |
| Datas inválidas e sem dados | Seletores; há dados em outubro e novembro até dia 17 |
| Comparação relativa | `/comparar`; períodos até 62 dias e lacunas sem dados |
| Imóveis parecidos | `/semelhantes`; média fictícia e aviso de privacidade |
| Exportação | Modal em histórico/comparação, gerando/pronto; CSV e relatório para impressão em PDF |
| Enviar ao síndico | Orientação para compartilhar o arquivo manualmente |
| Dicas e perfil | `/dicas`; estado offline usa dicas genéricas |
| Condomínio | `/condominio`; filtro de bloco e ordenação por unidade, consumo ou variação |

CSV é um download real com separador `;`, decimais com vírgula, BOM UTF-8 e proteção contra fórmulas em texto. PDF usa a impressão do navegador, sem uma biblioteca externa. Não há envio de arquivos ao síndico ou uso de dados reais de imóveis semelhantes.

O histórico diário soma 8,2 m³ no mês e 0,412 m³ no dia 17. A comparação inicial dá aproximadamente −12%, mas compara novembro parcial e outubro completo; essa diferença de cobertura é explicada na tela. Grupos semanais e mensais preservam o total.

Validação desta parte: `node --test tests/economy.test.mjs`. QA de navegador: rejeição de tarifa zero e aplicação da tarifa válida.
