import { ForbiddenException, Injectable } from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/auth.types';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}
  async authorize(
    userId: string,
    organizationId: string,
    roles?: MembershipRole[],
  ): Promise<TenantContext> {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });
    if (!membership || (roles && !roles.includes(membership.role)))
      throw new ForbiddenException('Acesso negado para esta organização');
    return { userId, organizationId, role: membership.role };
  }
  async organizationForSite(
    userId: string,
    siteId: string,
    roles?: MembershipRole[],
  ): Promise<TenantContext> {
    const site = await this.prisma.site.findUnique({
      where: { id: siteId },
      select: { organizationId: true },
    });
    if (!site) throw new ForbiddenException('Local não disponível');
    return this.authorize(userId, site.organizationId, roles);
  }
}
