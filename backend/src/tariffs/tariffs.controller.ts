import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenancy/tenant.service';
class PutTariffDto {
  @IsUUID() organizationId!: string;
  @IsOptional() @IsUUID() siteId?: string;
  @IsOptional() @IsString() currency?: string;
  @IsNumber() @Min(0) pricePerM3!: number;
  @Type(() => Date) @IsDate() effectiveFrom!: Date;
  @IsOptional() @Type(() => Date) @IsDate() effectiveTo?: Date;
}
@ApiTags('tariffs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tariffs')
export class TariffsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantService,
  ) {}
  @Get() async list(@CurrentUser() u: AuthUser, @Query('organizationId') o: string) {
    await this.tenant.authorize(u.sub, o);
    return this.prisma.tariff.findMany({
      where: { organizationId: o },
      orderBy: { effectiveFrom: 'desc' },
    });
  }
  @Put() async put(@CurrentUser() u: AuthUser, @Body() d: PutTariffDto) {
    await this.tenant.authorize(u.sub, d.organizationId, ['OWNER', 'ADMIN']);
    return this.prisma.tariff.create({ data: d });
  }
}
