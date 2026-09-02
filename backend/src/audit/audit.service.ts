import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}
  async record(input: {
    organizationId: string;
    actorUserId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    metadata?: object;
  }): Promise<void> {
    await this.prisma.auditLog.create({ data: input });
  }
}
