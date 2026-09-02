import { ApiProperty } from '@nestjs/swagger';
import { OrganizationType } from '@prisma/client';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty() @IsString() @MinLength(2) name!: string;
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() @MinLength(8) password!: string;
  @ApiProperty() @IsString() @MinLength(2) organizationName!: string;
  @ApiProperty({ enum: OrganizationType })
  @IsEnum(OrganizationType)
  organizationType!: OrganizationType;
}
export class LoginDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() password!: string;
}
export class RefreshDto {
  @ApiProperty() @IsString() refreshToken!: string;
}
export class ForgotPasswordDto {
  @ApiProperty() @IsEmail() email!: string;
}
export class ResetPasswordDto {
  @ApiProperty() @IsString() token!: string;
  @ApiProperty() @IsString() @MinLength(8) password!: string;
}
