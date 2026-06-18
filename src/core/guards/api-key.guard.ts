/**
 * ─────────────────────────────────────────────
 *  api-key.guard.ts — API 密钥守卫
 * ─────────────────────────────────────────────
 *
 * 前端类比：路由守卫（beforeEach）。
 *
 * 在前端你可能会写：
 *   router.beforeEach((to, from, next) => {
 *     if (!isLoggedIn) next('/login')
 *     else next()
 *   })
 *
 * Guard 做的事情一模一样——在请求到达 Controller 之前，
 * 决定是"放行"还是"拒绝"。
 *
 * 常见问题：
 *   Q: @Injectable() 又出现了？
 *   A: 是的，Guard 也是被 DI 管理的，所以也需要 @Injectable()。
 *
 *   Q: implements CanActivate 是什么？
 *   A: Guard 必须实现 CanActivate 接口（合同），
 *      接口规定你必须有 canActivate 方法，返回 true 或 false。
 *      true = 放行，false = 拒绝（返回 403 Forbidden）
 *
 *   Q: ExecutionContext 是啥？
 *   A: 当前请求的上下文，可以从里面拿到 request、response 等。
 *      类似前端的 to、from 路由信息。
 */

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  // 注入 ConfigService，获取环境变量 API_KEY
  constructor(private readonly configService: ConfigService) {}

  // canActivate 方法：返回 true 放行，false 拒绝
  // context: 当前请求上下文，可以从中获取 request 对象
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    // 从环境变量读取 API_KEY（.env 文件中配置的）
    const apiKey = this.configService.get<string>('API_KEY');

    // 如果没配置 API_KEY，直接放行（开发模式方便调试）
    if (!apiKey) return true;

    // 检查请求头 X-API-Key 是否匹配
    // 前端调用时需要设置请求头：
    //   headers: { 'X-API-Key': 'your-secret-key' }
    return request.header('X-API-Key') === apiKey;
  }
}
