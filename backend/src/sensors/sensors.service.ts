import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { hash } from 'argon2';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenancy/tenant.service';
import { CreateSensorDto, UpdateSensorDto } from './dto';

@Injectable()
export class SensorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantService,
    private readonly audit: AuditService,
  ) {}
  async list(userId: string, organizationId: string) {
    await this.tenant.authorize(userId, organizationId);
    return this.prisma.sensor.findMany({
      where: { site: { organizationId } },
      include: { site: true, zone: true },
    });
  }
  async create(userId: string, dto: CreateSensorDto) {
    const ctx = await this.tenant.organizationForSite(userId, dto.siteId, [
      'OWNER',
      'ADMIN',
      'MANAGER',
    ]);
    if (dto.zoneId) {
      const zone = await this.prisma.zone.findFirst({
        where: { id: dto.zoneId, siteId: dto.siteId },
      });
      if (!zone) throw new BadRequestException('Zona não pertence ao local');
    }
    const sensor = await this.prisma.sensor.create({ data: dto });
    await this.audit.record({
      organizationId: ctx.organizationId,
      actorUserId: userId,
      action: 'SENSOR_CREATED',
      resourceType: 'Sensor',
      resourceId: sensor.id,
    });
    return sensor;
  }
  async update(userId: string, id: string, dto: UpdateSensorDto) {
    const sensor = await this.prisma.sensor.findUnique({ where: { id }, include: { site: true } });
    if (!sensor) throw new NotFoundException('Sensor não encontrado');
    await this.tenant.authorize(userId, sensor.site.organizationId, ['OWNER', 'ADMIN', 'MANAGER']);
    return this.prisma.sensor.update({ where: { id }, data: dto });
  }
  async rotateCredential(userId: string, id: string) {
    const sensor = await this.prisma.sensor.findUnique({ where: { id }, include: { site: true } });
    if (!sensor) throw new NotFoundException('Sensor não encontrado');
    await this.tenant.authorize(userId, sensor.site.organizationId, ['OWNER', 'ADMIN']);
    const secret = randomBytes(32).toString('base64url');
    await this.prisma.$transaction([
      this.prisma.sensorCredential.updateMany({
        where: { sensorId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      this.prisma.sensorCredential.create({
        data: { sensorId: id, secretHash: await hash(secret) },
      }),
    ]);
    await this.audit.record({
      organizationId: sensor.site.organizationId,
      actorUserId: userId,
      action: 'SENSOR_CREDENTIAL_ROTATED',
      resourceType: 'Sensor',
      resourceId: id,
    });
    return {
      sensorId: id,
      secret,
      warning: 'Guarde este segredo: ele não será exibido novamente.',
    };
  }
}
