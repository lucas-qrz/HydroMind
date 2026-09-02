import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    if (await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } }))
      throw new ConflictException('E-mail já cadastrado');
    const passwordHash = await hash(dto.password);
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: dto.name, email: dto.email.toLowerCase(), passwordHash },
      });
      const organization = await tx.organization.create({
        data: { name: dto.organizationName, type: dto.organizationType },
      });
      await tx.membership.create({
        data: { userId: user.id, organizationId: organization.id, role: 'OWNER' },
      });
      await tx.notificationPreference.create({ data: { userId: user.id } });
      await tx.subscription.create({ data: { organizationId: organization.id } });
      return { user, organization };
    });
    return {
      user: this.publicUser(result.user),
      organization: result.organization,
      ...(await this.issueTokens(result.user.id, result.user.email)),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || user.status !== 'ACTIVE' || !(await verify(user.passwordHash, dto.password)))
      throw new UnauthorizedException('Credenciais inválidas');
    return { user: this.publicUser(user), ...(await this.issueTokens(user.id, user.email)) };
  }

  async refresh(rawToken: string) {
    let payload: { sub: string; jti: string; email: string };
    try {
      payload = await this.jwt.verifyAsync(rawToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
    const stored = await this.prisma.refreshToken.findUnique({ where: { id: payload.jti } });
    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt <= new Date() ||
      !(await verify(stored.tokenHash, rawToken))
    )
      throw new UnauthorizedException('Refresh token inválido');
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    return this.issueTokens(payload.sub, payload.email);
  }

  async logout(rawToken: string): Promise<{ success: true }> {
    try {
      const payload = await this.jwt.verifyAsync<{ jti: string }>(rawToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        ignoreExpiration: true,
      });
      await this.prisma.refreshToken.updateMany({
        where: { id: payload.jti, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      /* Logout é idempotente e nunca revela a validade do token. */
    }
    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return { accepted: true };
    const token = randomBytes(32).toString('base64url');
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: await hash(token),
        expiresAt: new Date(Date.now() + 30 * 60000),
      },
    });
    return {
      accepted: true,
      developmentToken: this.config.get('NODE_ENV') === 'development' ? token : undefined,
    };
  }

  async resetPassword(token: string, password: string): Promise<{ success: true }> {
    const candidates = await this.prisma.passwordResetToken.findMany({
      where: { usedAt: null, expiresAt: { gt: new Date() } },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
    const checked = await Promise.all(
      candidates.map(async (item) =>
        (await verify(item.tokenHash, token).catch(() => false)) ? item : null,
      ),
    );
    const matched = checked.find((item) => item !== null);
    if (!matched) throw new UnauthorizedException('Token de recuperação inválido ou expirado');
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: matched.userId },
        data: { passwordHash: await hash(password) },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: matched.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: matched.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    return { success: true };
  }

  private async issueTokens(userId: string, email: string) {
    const record = await this.prisma.refreshToken.create({
      data: { userId, tokenHash: 'pending', expiresAt: new Date(Date.now() + 7 * 86400000) },
    });
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_TTL', '15m'),
      },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, email, jti: record.id },
      {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_TTL', '7d'),
      },
    );
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { tokenHash: await hash(refreshToken) },
    });
    return { accessToken, refreshToken };
  }
  private publicUser(user: { id: string; name: string; email: string; status: string }) {
    return { id: user.id, name: user.name, email: user.email, status: user.status };
  }
}
