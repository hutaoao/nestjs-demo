/**
 * ─────────────────────────────────────────────
 *  jwt-auth.guard.ts — JWT 认证守卫
 * ─────────────────────────────────────────────
 *
 * 前端类比：Vue Router 里的 beforeEach：
 *   router.beforeEach((to, from, next) => {
 *     if (to.meta.requiresAuth && !isLoggedIn) {
 *       next('/login')    // 没登录 → 跳登录页
 *     } else {
 *       next()            // 已登录 → 放行
 *     }
 *   })
 *
 * 这个 Guard 做的事完全一样：
 *   - 检查是否有有效的 JWT Token
 *   - 如果没有 → 返回 401 Unauthorized
 *   - 如果有 → 放行，并把用户信息挂到 request.user
 *
 * 常见问题：
 *   Q: @Injectable() 是什么？
 *   A: 标记这个类可被 DI 管理。
 *
 *   Q: extends AuthGuard('jwt') 是啥？
 *   A: AuthGuard 是 @nestjs/passport 提供的"通用守卫"。
 *      AuthGuard('jwt') 自动使用我们写的 JwtStrategy 来验证 Token。
 *      如果改成 AuthGuard('local')，就会用用户名+密码策略去验证。
 *
 *   Q: ExecutionContext 参数呢？
 *   A: AuthGuard('jwt') 内部已经处理了 ExecutionContext，
 *      我们只需要在 canActivate 里先检查 @Public() 装饰器即可。
 */

import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
// extends AuthGuard('jwt')：继承 Passport 的 JWT 认证守卫
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Reflector：NestJS 的"反射器"，用来读取方法上的装饰器元数据
  constructor(private readonly reflector: Reflector) {
    super();
  }

  // canActivate：决定请求是否放行
  // 返回 true 放行，false 拒绝
  canActivate(context: ExecutionContext) {
    // 检查当前请求的方法（Controller 的方法）上是否有 @Public() 装饰器
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),    // 当前调用的方法
      context.getClass(),      // 当前调用的类（Controller）
    ]);

    // 如果方法上有 @Public() 装饰器 → 直接放行，不校验 Token
    if (isPublic) return true;

    // 没有 @Public() → 调用父类的 canActivate 去校验 JWT Token
    return super.canActivate(context);
  }
}
