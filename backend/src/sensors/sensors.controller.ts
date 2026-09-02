import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSensorDto, UpdateSensorDto } from './dto';
import { SensorsService } from './sensors.service';
@ApiTags('sensors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sensors')
export class SensorsController {
  constructor(private readonly service: SensorsService) {}
  @Get() list(@CurrentUser() u: AuthUser, @Query('organizationId') o: string) {
    return this.service.list(u.sub, o);
  }
  @Post() create(@CurrentUser() u: AuthUser, @Body() d: CreateSensorDto) {
    return this.service.create(u.sub, d);
  }
  @Patch(':id') update(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() d: UpdateSensorDto,
  ) {
    return this.service.update(u.sub, id, d);
  }
  @Post(':id/credentials/rotate') rotate(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.service.rotateCredential(u.sub, id);
  }
}
