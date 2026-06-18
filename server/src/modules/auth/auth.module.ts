/**
 * ─────────────────────────────────────────────
 *  auth.module.ts — 认证模块
 * ─────────────────────────────────────────────
 *
 * 将所有认证相关的文件打包成一个模块。
 * @Global() 让 AuthModule 导出的 Guard、Decorator 在所有模块中直接可用。
 *
 * 常见问题：
 *   Q: @Global() 有什么用？
 *   A: 不加 @Global() 的话，其他模块（如 PostsModule）想用 JwtAuthGuard，
 *      必须在 PostsModule 的 imports 中导入 AuthModule。
 *      加了 @Global() 后，AuthModule 导出的东西全局可用。
 *
 *   Q: JwtModule.registerAsync({ useFactory }) 是啥？
 *   A: 动态配置 JwtModule。因为 JWT_SECRET 存在 .env 文件里，
 *      需要在运行时通过 ConfigService 读取，所以用 registerAsync。
 *
 *   Q: PassportModule.register({ defaultStrategy: 'jwt' }) 是啥？
 *   A: 配置 Passport，告诉它"默认用 JWT 策略"。
 *      当我们调用 AuthGuard('jwt') 时，它就自动使用 JwtStrategy。
 */

import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Global()  // ← 这行让 AuthModule 全局可用，其他模块不用 imports 也能用 JwtAuthGuard
@Module({
  imports: [
    // ── Passport 配置 ──
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // ── JWT 模块（异步配置，从 .env 读取密钥） ──
    JwtModule.registerAsync({
      imports: [ConfigModule],     // 需要 ConfigModule 提供 ConfigService
      inject: [ConfigService],      // 注入 ConfigService
      useFactory: (config: ConfigService) => ({
        // JWT_SECRET：用于签发和验证 Token 的密钥
        secret: config.getOrThrow<string>('JWT_SECRET'),
        // JWT Token 有效期 7 天
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],            // 注册控制器
  providers: [AuthService, JwtStrategy],     // 注册提供者
  // 导出 JwtStrategy 和 PassportModule，这样其他模块才能用 AuthGuard('jwt')
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
