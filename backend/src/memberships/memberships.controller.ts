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
import { MembershipRole } from '@prisma/client';
import { IsEmail, IsEnum } from 'class-validator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenancy/tenant.service';
class AddMemberDto {
  @IsEmail() email!: string;
  @IsEnum(MembershipRole) role!: MembershipRole;
}
class RoleDto {
  @IsEnum(MembershipRole) role!: MembershipRole;
}
@ApiTags('memberships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('memberships')
export class MembershipsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantService,
  ) {}
  @Get() async list(@CurrentUser() u: AuthUser, @Query('organizationId') o: string) {
    await this.tenant.authorize(u.sub, o);
    return this.prisma.membership.findMany({
      where: { organizationId: o },
      include: { user: { select: { id: true, name: true, email: true, status: true } } },
    });
  }
  @Post() async add(
    @CurrentUser() u: AuthUser,
    @Query('organizationId') o: string,
    @Body() d: AddMemberDto,
  ) {
    await this.tenant.authorize(u.sub, o, ['OWNER', 'ADMIN']);
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { email: d.email.toLowerCase() },
    });
    return this.prisma.membership.create({
      data: { organizationId: o, userId: user.id, role: d.role },
    });
  }
  @Patch(':userId') async role(
    @CurrentUser() u: AuthUser,
    @Param('userId') id: string,
    @Query('organizationId') o: string,
    @Body() d: RoleDto,
  ) {
    await this.tenant.authorize(u.sub, o, ['OWNER', 'ADMIN']);
    return this.prisma.membership.update({
      where: { userId_organizationId: { userId: id, organizationId: o } },
      data: { role: d.role },
    });
  }
  @Delete(':userId') async remove(
    @CurrentUser() u: AuthUser,
    @Param('userId') id: string,
    @Query('organizationId') o: string,
  ) {
    await this.tenant.authorize(u.sub, o, ['OWNER']);
    await this.prisma.membership.delete({
      where: { userId_organizationId: { userId: id, organizationId: o } },
    });
    return { success: true };
  }
}
