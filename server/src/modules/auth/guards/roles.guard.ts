/**
 * ─────────────────────────────────────────────
 *  roles.guard.ts — 角色授权守卫
 * ─────────────────────────────────────────────
 *
 * 前端类比：Vue Router 里的角色检查：
 *   router.beforeEach((to, from, next) => {
 *     if (to.meta.roles && !to.meta.roles.includes(user.role)) {
 *       next('/403')  // 角色不匹配 → 跳 403 页面
 *     } else {
 *       next()         // 角色匹配 → 放行
 *     }
 *   })
 *
 * 这个 Guard 做的事完全一样——检查当前用户的角色是否在允许的角色列表中。
 *
 * 使用方式：
 *   @Roles('admin')                   // 只有 admin 能访问
 *   @UseGuards(JwtAuthGuard, RolesGuard)  // 两个守卫一起用
 *   getAdminData() { ... }
 *
 * ExecutionContext 演示：
 *   context.getHandler()  → 返回当前调用的方法（如 getAdminData）
 *   context.getClass()    → 返回当前调用的类（如 TagsController）
 *   这俩方法可以让你知道"当前哪个 Controller 的哪个方法被调用了"。
 *   在 Guard 里可以做更精细的控制，比如：
 *   - 记录操作日志：谁调了哪个方法
 *   - 权限细化：不同的方法有不同的权限要求
 */

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // ── 读取 @Roles() 装饰器设置的角色列表 ──
    // 如果方法上没有 @Roles() 装饰器，roles 就是 undefined
    // 这时表示"所有登录用户都能访问"
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [
        context.getHandler(),  // 执行上下文可以拿到：当前调用的方法
        context.getClass(),    // 执行上下文可以拿到：当前调用的类
      ],
    );

    // 没有角色要求 → 所有登录用户都能访问
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // ── 获取当前用户的角色 ──
    // request.user 是 JwtAuthGuard 验证通过后挂载上去的
    // JwtStrategy 的 validate 方法返回了 { userId, username, role }
    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: string } | undefined;

    // 没有用户信息（理论上不会发生，因为 RolesGuard 前面有 JwtAuthGuard）
    if (!user) return false;

    // 检查用户的角色是否在允许的角色列表中
    // 比如 @Roles('admin') → 只有 role === 'admin' 才能访问
    // 比如 @Roles('admin', 'editor') → admin 或 editor 都能访问
    return requiredRoles.includes(user.role ?? '');
  }
}
