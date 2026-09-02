import { OrganizationType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
export class CreateOrganizationDto {
  @IsString() @MinLength(2) name!: string;
  @IsEnum(OrganizationType) type!: OrganizationType;
}
export class UpdateOrganizationDto {
  @IsOptional() @IsString() @MinLength(2) name?: string;
  @IsOptional() @IsEnum(OrganizationType) type?: OrganizationType;
}
