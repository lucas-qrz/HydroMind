# Parte 6 · DG

Responsabilidade de revisão: planos, pagamento, assinatura, instalação e SAC.

| Requisito | Tela/ação |
| --- | --- |
| Três planos e economia anual | `/planos`; R$ 29,90/mês, R$ 79,90/trimestre, R$ 279,90/ano |
| Resumo e kit | `/pedido`; cinco sensores opcionais por R$ 499,00 |
| Pix, crédito e débito | `/pagamento`; contador, copiar código e formulário demonstrativo |
| Processando, aprovado, recusado, expirado | Ações e seletor de estados; `/pagamento/aprovado` |
| Assinatura | `/assinatura`; plano, método, próxima cobrança e troca |
| Cancelamento em três passos | `/cancelar/motivo` → `/cancelar/oferta` → `/cancelar/confirmar` → `/cancelar/final` |
| Tutoriais e estados | `/tutoriais`; três guias ilustrados |
| Player | `/tutorial/primeiros-passos`; play/pausa, busca, CC, tela cheia/paisagem e transcrição |
| Solicitar profissional | `/instalacao`; CEP, imóvel, contato, observações e agenda |
| Visita e alterações | `/visita`; linha do tempo, avatar ilustrativo, reagendar e cancelar |
| Central e formulário | `/suporte`; horário, status e aviso fora do expediente |
| Chat | `/chat`; resposta automática ilustrativa e indicador de digitação |
| Protocolos e histórico | `/chamados`, `/chamado/SAC-20261110-0001` |

Cartão fictício: `4242 4242 4242 4242`, validade `12/30`, CVV `123`. Esses campos não são persistidos. Pix e QR são não pagáveis. Não existe integração de cobrança.

O player não contém gravação real; ele demonstra a experiência com sequência visual e transcrição. O profissional tem um avatar ilustrativo, sem usar a fotografia de uma pessoa real. CEP e SAC também são simulações; o telefone mostrado não oferece atendimento.

Validação desta parte: `node --test tests/services.test.mjs`. QA de navegador: cartão fictício → aprovado; solicitação → visita → reagendamento; formulário de suporte → protocolo.
