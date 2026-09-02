import { SensorStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
export class CreateSensorDto {
  @IsUUID() siteId!: string;
  @IsOptional() @IsUUID() zoneId?: string;
  @IsString() serialNumber!: string;
  @IsString() @MinLength(2) name!: string;
  @IsOptional() @IsString() firmwareVersion?: string;
}
export class UpdateSensorDto {
  @IsOptional() @IsUUID() zoneId?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEnum(SensorStatus) status?: SensorStatus;
  @IsOptional() @IsString() firmwareVersion?: string;
}
