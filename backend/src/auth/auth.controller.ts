import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RefreshDto, RegisterDto, ResetPasswordDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}
  @Post('register') register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }
  @Post('login') login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }
  @Post('refresh') refresh(@Body() dto: RefreshDto) {
    return this.service.refresh(dto.refreshToken);
  }
  @Post('logout') logout(@Body() dto: RefreshDto) {
    return this.service.logout(dto.refreshToken);
  }
  @Post('forgot-password') forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.service.forgotPassword(dto.email);
  }
  @Post('reset-password') resetPassword(@Body() dto: ResetPasswordDto) {
    return this.service.resetPassword(dto.token, dto.password);
  }
}
