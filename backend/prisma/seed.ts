import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';
const prisma = new PrismaClient();
async function main() {
  const passwordHash = await hash('HydroMind@123');
  const user = await prisma.user.upsert({
    where: { email: 'demo@hydromind.local' },
    update: {},
    create: {
      name: 'Usuário Demo',
      email: 'demo@hydromind.local',
      passwordHash,
      notificationPreference: { create: {} },
    },
  });
  const organization = await prisma.organization.create({
    data: {
      name: 'HydroMind Demo',
      type: 'RESIDENTIAL',
      memberships: { create: { userId: user.id, role: 'OWNER' } },
      subscription: { create: { plan: 'MVP' } },
    },
  });
  const home = await prisma.site.create({
    data: {
      organizationId: organization.id,
      name: 'Residência Demo',
      timezone: 'America/Sao_Paulo',
      address: 'São Paulo - SP',
    },
  });
  const company = await prisma.site.create({
    data: { organizationId: organization.id, name: 'Escola Demo', timezone: 'America/Sao_Paulo' },
  });
  const kitchen = await prisma.zone.create({ data: { siteId: home.id, name: 'Cozinha' } });
  const bathroom = await prisma.zone.create({ data: { siteId: home.id, name: 'Banheiro' } });
  const sensors = await Promise.all(
    [
      { siteId: home.id, zoneId: kitchen.id, serialNumber: 'DEMO-COZ-01', name: 'Cozinha' },
      { siteId: home.id, zoneId: bathroom.id, serialNumber: 'DEMO-BAN-01', name: 'Banheiro' },
      { siteId: company.id, serialNumber: 'DEMO-ESC-01', name: 'Entrada principal' },
    ].map((d) => prisma.sensor.create({ data: d })),
  );
  await prisma.tariff.create({
    data: {
      organizationId: organization.id,
      currency: 'BRL',
      pricePerM3: 9.18,
      effectiveFrom: new Date('2026-01-01T00:00:00Z'),
    },
  });
  const now = new Date();
  for (let day = 6; day >= 0; day--)
    for (const sensor of sensors) {
      const timestamp = new Date(now.getTime() - day * 86400000);
      const volumeDelta = 70 + Math.random() * 80;
      await prisma.telemetryReading.create({
        data: {
          sensorId: sensor.id,
          timestamp,
          volumeDelta,
          flowRate: 2 + Math.random() * 5,
          externalReadingId: `seed-${day}`,
        },
      });
      const bucket = new Date(
        Date.UTC(timestamp.getUTCFullYear(), timestamp.getUTCMonth(), timestamp.getUTCDate()),
      );
      await prisma.consumptionAggregate.upsert({
        where: {
          scopeKey_bucketStart_granularity: {
            scopeKey: `sensor:${sensor.id}`,
            bucketStart: bucket,
            granularity: 'DAY',
          },
        },
        create: {
          organizationId: organization.id,
          siteId: sensor.siteId,
          sensorId: sensor.id,
          scopeKey: `sensor:${sensor.id}`,
          bucketStart: bucket,
          granularity: 'DAY',
          volume: volumeDelta,
        },
        update: { volume: { increment: volumeDelta } },
      });
    }
  console.log({
    login: 'demo@hydromind.local',
    password: 'HydroMind@123',
    organizationId: organization.id,
  });
}
void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
