import { Transform, Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsUUID } from 'class-validator';
export class ConsumptionQueryDto {
  @Type(() => Date) @IsDate() from!: Date;
  @Type(() => Date) @IsDate() to!: Date;
  @Transform(({ value }: { value: string }) => value.toUpperCase())
  @IsIn(['HOUR', 'DAY', 'MONTH'])
  granularity!: 'HOUR' | 'DAY' | 'MONTH';
  @IsUUID() organizationId!: string;
  @IsOptional() @IsUUID() siteId?: string;
  @IsOptional() @IsUUID() zoneId?: string;
  @IsOptional() @IsUUID() sensorId?: string;
}
