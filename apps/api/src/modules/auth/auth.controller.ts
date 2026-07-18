import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { type User } from '@prisma/client';
import type { Request, Response } from 'express';
import { AuthService, REFRESH_TOKEN_EXPIRES } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';

const refreshCookieName = 'refresh_token';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = (await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    )) as Omit<User, 'passwordHash' | 'refreshTokenHash'> | null;
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const result = await this.authService.login(user);

    this.setRefreshTokenCookie(response, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body('refreshToken') bodyRefreshToken?: string,
  ) {
    const refreshToken = this.getRefreshTokenFromCookie(request);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const result = await this.authService.refresh(refreshToken);

    this.setRefreshTokenCookie(response, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: User,
  ) {
    response.clearCookie(refreshCookieName);
    return this.authService.logout(user.id);
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
    };
  }

  // --- Helper ---

  private getRefreshTokenFromCookie(request: Request): string {
    const token = request.cookies?.[refreshCookieName] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return token;
  }

  private setRefreshTokenCookie(
    response: Response,
    refreshToken: string,
  ): void {
    response.cookie(refreshCookieName, refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax' as const,
      maxAge: REFRESH_TOKEN_EXPIRES,
      path: '/',
    });
  }
}
