# HydroMind Backend - Água Alerta

API NestJS multi-tenant para ingestão de telemetria hídrica, consolidação de consumo, estimativa de custo, detecção de anomalias e alertas.

## Arquitetura

- **NestJS + TypeScript strict**: API REST modular, validação e Swagger.
- **PostgreSQL + Prisma**: dados transacionais, telemetria, agregados e migrations.
- **Autenticação dupla**: JWT para pessoas; segredo rotacionável e armazenado com Argon2 para sensores.
- **Multi-tenancy**: todo recurso é filtrado por organização e validado pelo `TenantService`.
- **Motor de regras**: `AnomalyDetector` desacoplado, pronto para um futuro modelo de IA.
- **Agregação incremental**: cada leitura atualiza buckets de hora, dia e mês.

## Executar localmente

Requisitos: Node.js 22, Docker e Docker Compose.

```bash
cp .env.example .env
docker compose up -d postgres
npm install
npx prisma generate
npm run migrate:dev -- --name init
npm run seed
npm run start:dev
```

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/docs`
- Health: `http://localhost:3000/api/health`

O seed informa no terminal o `organizationId`. Credenciais de demonstração: `demo@hydromind.local` / `HydroMind@123`. Troque a senha fora do ambiente acadêmico.

## Fluxo de provisionamento e IoT

1. Faça login e envie o access token como `Authorization: Bearer <token>`.
2. Cadastre um site e um sensor.
3. Execute `POST /api/sensors/:id/credentials/rotate`. O segredo aparece uma única vez.
4. Envie a leitura com `x-sensor-secret`:

```bash
curl -X POST http://localhost:3000/api/iot/telemetry \
  -H 'Content-Type: application/json' \
  -H 'x-sensor-secret: SEU_SEGREDO' \
  -d '{"sensorId":"UUID","externalReadingId":"device-seq-12345","timestamp":"2026-09-02T15:00:00Z","flowRate":8.4,"volumeDelta":0.18,"totalVolume":1240.6,"batteryLevel":87,"signalStrength":-62}'
```

Reenvios com o mesmo `sensorId + externalReadingId` são idempotentes. Datas são armazenadas em UTC. Senhas, tokens e segredos não são registrados nos logs.

## Endpoints principais

`/auth`, `/me`, `/organizations`, `/memberships`, `/sites`, `/zones`, `/sensors`, `/iot/telemetry`, `/consumption`, `/tariffs`, `/anomalies`, `/alerts`, `/dashboard/summary`, `/reports/consumption`, `/notification-preferences`, `/subscriptions` e `/health`.

## Qualidade

```bash
npm run lint
npm test
npm run build
```

## Decisões e limites do MVP

- Redis/BullMQ e MQTT ficaram fora da primeira versão: a API HTTP e os upserts transacionais atendem ao volume da demonstração sem infraestrutura extra.
- Regras atuais: fluxo contínuo, aumento incomum, consumo noturno, pico e sensor offline. Limiar e cooldown vêm do ambiente.
- Notificações in-app estão estruturadas; e-mail e push dependem de provedores futuros.
- Assinaturas possuem modelo persistente, mas não há cobrança real.
- Tarifa é configurável e versionada. Sem tarifa, o consumo continua disponível e o custo retorna `null`.
