import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export const REFRESH_TOKEN_EXPIRES = 30 * 24 * 60 * 60; // 30 days
export const JWT_ACCESS_EXPIRES = 15 * 60; // 15 minutes

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && bcrypt.compareSync(pass, user.passwordHash)) {
      const { passwordHash, refreshTokenHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User, 'passwordHash' | 'refreshTokenHash'>) {
    const payload = { email: user.email, sub: user.id };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: `${JWT_ACCESS_EXPIRES}s`,
    });

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.jwtSecret,
        expiresIn: `${REFRESH_TOKEN_EXPIRES}s`,
      },
    );

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(refreshToken, salt);
    await this.usersService.updateRefreshTokenHash(user.id, hash);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(
        refreshToken,
        {
          secret: this.jwtSecret,
        },
      );

      const userId = payload.sub;
      const user = await this.usersService.findById(userId);

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const isMatch = bcrypt.compareSync(refreshToken, user.refreshTokenHash);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Generate new access token
      const accessPayload = { email: user.email, sub: user.id };
      const accessToken = await this.jwtService.signAsync(accessPayload, {
        secret: this.jwtSecret,
        expiresIn: `${REFRESH_TOKEN_EXPIRES}s`,
      });

      // Generate new refresh token (rotation)
      const newRefreshToken = await this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: this.jwtSecret,
          expiresIn: `${REFRESH_TOKEN_EXPIRES}s`,
        },
      );

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(newRefreshToken, salt);
      await this.usersService.updateRefreshTokenHash(user.id, hash);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshTokenHash(userId, null);
    return { success: true };
  }
}
