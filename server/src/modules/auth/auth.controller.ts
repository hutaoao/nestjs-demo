/**
 * ─────────────────────────────────────────────
 *  auth.controller.ts — 认证控制器
 * ─────────────────────────────────────────────
 *
 * 三个端点：
 *   1. POST /auth/register — 注册（公开）
 *   2. POST /auth/login    — 登录（公开）
 *   3. GET  /auth/profile   — 当前用户信息（需 JWT）
 *
 * 前端类比：
 *   const api = {
 *     register: (data) => axios.post('/auth/register', data),
 *     login:    (data) => axios.post('/auth/login', data),
 *     profile:  () => axios.get('/auth/profile', { headers: { Authorization: `Bearer ${token}` } }),
 *   }
 */

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── POST /auth/register 注册 ──
  // @Public() 跳过 JWT 认证（因为注册时还没有 Token）
  @Public()
  @Post('register')
  @ApiOperation({ summary: '注册新用户，返回 JWT Token' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ── POST /auth/login 登录 ──
  @Public()
  @Post('login')
  @ApiOperation({ summary: '登录，返回 JWT Token' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ── GET /auth/profile 当前用户信息 ──
  // @UseGuards(JwtAuthGuard) 要求请求必须带有效的 JWT Token
  // @CurrentUser() 从 request.user 提取当前用户信息
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()  // Swagger 中标记这个接口需要 Bearer Token
  @ApiOperation({ summary: '获取当前登录用户的信息（需 Bearer Token）' })
  getProfile(
    // @CurrentUser() 是自定义参数装饰器
    // 它从 request.user 中提取当前登录用户的信息
    // JwtStrategy 的 validate 方法返回了 { userId, username, role }
    @CurrentUser() user: { userId: number },
  ) {
    // 用 userId 查数据库，返回用户详情（不含密码）
    return this.authService.getProfile(user.userId);
  }
}
