import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConsumptionService } from './consumption.service';
import { ConsumptionQueryDto } from './dto';
@ApiTags('consumption')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('consumption')
export class ConsumptionController {
  constructor(private readonly service: ConsumptionService) {}
  @Get() query(@CurrentUser() u: AuthUser, @Query() q: ConsumptionQueryDto) {
    return this.service.query(u.sub, q);
  }
}
