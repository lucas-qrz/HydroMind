# Parte 4 · Bazinga

Responsabilidade de revisão: alertas, ações, notificações e metas.

| Requisito | Tela/ação |
| --- | --- |
| Filtros, lidos e paginação | `/alertas`; hoje, 7/30 dias, personalizado, sensor, Carregar mais |
| Detalhe e gráfico | `/alerta/a1`; vazão, duração, horário e indicação ilustrativa de IA |
| Já resolvi e ignorar | Ações persistidas no navegador |
| Registro remoto | Confirmação → carregando → sucesso ou falha simulada |
| Resolvido e desperdício | Litros = vazão × minutos; custo converte L para m³ |
| Push iOS/Android e banner | `/push`; cada exemplo liga para o detalhe |
| Modo ausente e retorno | `/ausente`; “Estou em casa” |
| Preferências | `/notificacoes`; sete tipos, quatro canais e horário silencioso |
| Meta percentual e valor-alvo | `/metas`; 5/10/15/20% ou personalizado |
| Progresso, selos e resultado | `/metas`; estados atingida e não atingida |

Não há envio de push, e-mail, WhatsApp ou SMS nem comando a um registro real. O alerta de consumo fora de casa é um cenário demonstrativo. Selos e progresso circular são ilustrativos; o alvo em m³/R$ e o percentual em relação à referência são calculados com os dados atuais.

Validação desta parte: `node --test tests/alerts.test.mjs`. QA de navegador: confirmar registro → simular falha → tentar novamente → resolvido.
