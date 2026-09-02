import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenancy/tenant.service';
import { AuditService } from '../audit/audit.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';

@ApiTags('organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantService,
    private readonly audit: AuditService,
  ) {}
  @Get() list(@CurrentUser() user: AuthUser) {
    return this.prisma.organization.findMany({
      where: { memberships: { some: { userId: user.sub } } },
      include: { memberships: { where: { userId: user.sub }, select: { role: true } } },
    });
  }
  @Post() async create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrganizationDto) {
    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({ data: dto });
      await tx.membership.create({
        data: { userId: user.sub, organizationId: organization.id, role: 'OWNER' },
      });
      await tx.subscription.create({ data: { organizationId: organization.id } });
      return organization;
    });
  }
  @Patch(':id') async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    await this.tenant.authorize(user.sub, id, ['OWNER', 'ADMIN']);
    const organization = await this.prisma.organization.update({ where: { id }, data: dto });
    await this.audit.record({
      organizationId: id,
      actorUserId: user.sub,
      action: 'ORGANIZATION_UPDATED',
      resourceType: 'Organization',
      resourceId: id,
    });
    return organization;
  }
}
