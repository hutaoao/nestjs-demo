/**
 * ─────────────────────────────────────────────
 *  jwt.strategy.ts — Passport JWT 策略
 * ─────────────────────────────────────────────
 *
 * 这是 JWT 认证的核心——告诉 Passport "怎么验证 Token"。
 *
 * 前端类比：
 *   // 前端每次请求都带上 Token
 *   axios.defaults.headers.common['Authorization'] = 'Bearer xxx'
 *
 *   // 后端收到 Token 后，jwt.strategy.ts 负责：
 *   // 1. 从 Authorization 头提取 "Bearer xxx"
 *   // 2. 用 JWT_SECRET 解码 Token → 得到 { userId: 1, role: 'user' }
 *   // 3. 去数据库查这个用户是否存在 → 挂载到 request.user
 *
 * 常见问题：
 *   Q: passport-jwt 是什么？
 *   A: Passport 的一个"策略"。Passport 有很多策略：
 *      - passport-jwt: JWT Token 认证
 *      - passport-local: 用户名+密码认证
 *      - passport-github: GitHub OAuth 登录
 *      每个策略就是一个认证方式，NestJS 用 @nestjs/passport 统一管理。
 *
 *   Q: extractJwtFromAuthHeaderAsBearerToken() 是啥？
 *   A: 从请求头中提取 Token。比如请求头是：
 *      Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 *      它会提取出 "eyJhbGciOiJIUzI1NiIs..." 这段去解码。
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../../../core/database/database.service';

// JWT 解码后得到的 payload 结构
// userId 和 role 是在签发 Token 时放进去的
interface JwtPayload {
  userId: number;
  role: string;
}

@Injectable()
// extends PassportStrategy(Strategy):
//   告诉 NestJS "这个类是 Passport 的 JWT 策略"
//   Strategy 来自 passport-jwt，是 JWT 验证的核心逻辑
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly db: DatabaseService,
  ) {
    // super() 是调用父类构造函数，传入配置：
    super({
      // jwtFromRequest: 从哪提取 Token → 从 Authorization: Bearer xxx
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // secretOrKey: 用哪个密钥解码 → 必须和签发时用的密钥一致
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // validate 是"验证通过后的回调"：
  // 如果 Token 解码成功（签名正确、未过期），Passport 会调用这个方法
  // 如果 Token 无效（被篡改、过期），根本不会走到这里，直接返回 401
  async validate(payload: JwtPayload) {
    // payload = 解码 JWT 后得到的数据 { userId: 1, role: 'user' }
    // 去数据库查这个用户是否还存在（防止用户已被删除但 Token 还在有效期）
    const user = await this.db.user.findUnique({
      where: { id: payload.userId },
    });

    // 用户不存在 → 抛 401 Unauthorized
    if (!user) {
      throw new UnauthorizedException('用户不存在或已被删除');
    }

    // 返回的用户对象会被 Passport 自动挂载到 request.user
    // 这样 Controller 里就能通过 @CurrentUser() 装饰器拿到
    return { userId: user.id, username: user.username, role: user.role };
  }
}
