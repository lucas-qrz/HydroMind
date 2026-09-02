import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenancy/tenant.service';
import { AuditService } from '../audit/audit.service';
import { CreateSiteDto, CreateZoneDto, UpdateSiteDto, UpdateZoneDto } from './dto';

@ApiTags('sites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sites')
export class SitesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantService,
    private readonly audit: AuditService,
  ) {}
  @Get() async list(@CurrentUser() u: AuthUser, @Query('organizationId') organizationId: string) {
    await this.tenant.authorize(u.sub, organizationId);
    return this.prisma.site.findMany({
      where: { organizationId },
      include: { zones: true, _count: { select: { sensors: true } } },
    });
  }
  @Post() async create(@CurrentUser() u: AuthUser, @Body() dto: CreateSiteDto) {
    await this.tenant.authorize(u.sub, dto.organizationId, ['OWNER', 'ADMIN', 'MANAGER']);
    return this.prisma.site.create({ data: dto });
  }
  @Patch(':id') async update(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateSiteDto,
  ) {
    const ctx = await this.tenant.organizationForSite(u.sub, id, ['OWNER', 'ADMIN', 'MANAGER']);
    const site = await this.prisma.site.update({ where: { id }, data: dto });
    await this.audit.record({
      organizationId: ctx.organizationId,
      actorUserId: u.sub,
      action: 'SITE_UPDATED',
      resourceType: 'Site',
      resourceId: id,
    });
    return site;
  }
  @Delete(':id') async remove(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    await this.tenant.organizationForSite(u.sub, id, ['OWNER', 'ADMIN']);
    await this.prisma.site.delete({ where: { id } });
    return { success: true };
  }
}

@ApiTags('zones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('zones')
export class ZonesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantService,
  ) {}
  @Get() async list(@CurrentUser() u: AuthUser, @Query('siteId') siteId: string) {
    await this.tenant.organizationForSite(u.sub, siteId);
    return this.prisma.zone.findMany({
      where: { siteId },
      include: { _count: { select: { sensors: true } } },
    });
  }
  @Post() async create(@CurrentUser() u: AuthUser, @Body() dto: CreateZoneDto) {
    await this.tenant.organizationForSite(u.sub, dto.siteId, ['OWNER', 'ADMIN', 'MANAGER']);
    return this.prisma.zone.create({ data: dto });
  }
  @Patch(':id') async update(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateZoneDto,
  ) {
    const zone = await this.prisma.zone.findUnique({ where: { id } });
    if (!zone) return null;
    await this.tenant.organizationForSite(u.sub, zone.siteId, ['OWNER', 'ADMIN', 'MANAGER']);
    return this.prisma.zone.update({ where: { id }, data: dto });
  }
  @Delete(':id') async remove(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    const zone = await this.prisma.zone.findUnique({ where: { id } });
    if (!zone) return { success: true };
    await this.tenant.organizationForSite(u.sub, zone.siteId, ['OWNER', 'ADMIN']);
    await this.prisma.zone.delete({ where: { id } });
    return { success: true };
  }
}
