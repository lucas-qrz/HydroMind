import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
export class TelemetryDto {
  @IsUUID() sensorId!: string;
  @IsOptional() @IsString() externalReadingId?: string;
  @Type(() => Date) @IsDate() timestamp!: Date;
  @IsOptional() @IsNumber() @Min(0) flowRate?: number;
  @IsNumber() @Min(0) volumeDelta!: number;
  @IsOptional() @IsNumber() @Min(0) totalVolume?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) batteryLevel?: number;
  @IsOptional() @IsInt() signalStrength?: number;
}
