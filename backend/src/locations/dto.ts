import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
export class CreateSiteDto {
  @IsUUID() organizationId!: string;
  @IsString() @MinLength(2) name!: string;
  @IsString() timezone!: string;
  @IsOptional() @IsString() address?: string;
}
export class UpdateSiteDto {
  @IsOptional() @IsString() @MinLength(2) name?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() address?: string;
}
export class CreateZoneDto {
  @IsUUID() siteId!: string;
  @IsString() @MinLength(2) name!: string;
  @IsOptional() @IsString() description?: string;
}
export class UpdateZoneDto {
  @IsOptional() @IsString() @MinLength(2) name?: string;
  @IsOptional() @IsString() description?: string;
}
