import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { TelemetryDto } from './dto';
import { IotService } from './iot.service';
@ApiTags('iot')
@Controller('iot')
export class IotController {
  constructor(private readonly service: IotService) {}
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  @ApiHeader({ name: 'x-sensor-secret', required: true })
  @Post('telemetry')
  ingest(@Body() dto: TelemetryDto, @Headers('x-sensor-secret') secret?: string) {
    if (!secret) throw new UnauthorizedException('Credencial do sensor ausente');
    return this.service.ingest(dto, secret);
  }
}
