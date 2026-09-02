# HydroMind - Protótipo IoT

Protótipo navegável de um painel web para monitoramento de consumo de água por sensores IoT.

## Como abrir

Abra `index.html` em qualquer navegador moderno. O protótipo não precisa de instalação, servidor ou internet.

## O que já está representado

- consumo e vazão em tempo real com dados simulados;
- estimativa mensal em volume e custo;
- comparação com períodos anteriores;
- distribuição do consumo por ambiente;
- indicação da origem do maior gasto;
- detecção e tratamento de alertas de possível vazamento;
- acompanhamento dos sensores IoT, bateria e conectividade;
- visualização responsiva para computador e celular.

## Próxima etapa técnica sugerida

Substituir a simulação do `app.js` por uma API. Uma arquitetura inicial possível é: sensores de vazão → ESP32 → MQTT → serviço de ingestão → banco de séries temporais → API REST/WebSocket → painel web.

## Pontos provisórios

O símbolo e a paleta ainda são marcadores temporários, pois os dois PDFs originais não ficaram acessíveis ao ambiente. A identidade deve ser refinada com a marca oficial após o reenvio dos arquivos.
