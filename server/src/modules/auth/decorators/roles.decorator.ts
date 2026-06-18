/**
 * ─────────────────────────────────────────────
 *  roles.decorator.ts — @Roles() 自定义装饰器
 * ─────────────────────────────────────────────
 *
 * 前端类比：Vue 路由的 meta 字段。
 *   const route = {
 *     path: '/admin',
 *     meta: { roles: ['admin'] }  // 只有 admin 角色能访问
 *   }
 *
 * 这里的 @Roles('admin') 做的事情一模一样——
 * 把角色信息"贴"在方法上，然后 RolesGuard 读取它来做权限检查。
 *
 * 常见问题：
 *   Q: SetMetadata 是啥？
 *   A: NestJS 提供的"设置元数据"工具。相当于给函数贴了个标签，
 *      Reflector（反射器）可以在运行时读取这个标签。
 *      类似 Python 的 @property、Java 的 @Override。
 *
 *   Q: ROLES_KEY 为什么用字符串常量？
 *   A: 为了保证 @Roles('admin') 和 RolesGuard 中读取的是同一个 key，
 *      避免拼写错误。用常量比直接写字符串 'roles' 更安全。
 */

import { SetMetadata } from '@nestjs/common';

// ROLES_KEY：元数据的 key，用 Symbol 或字符串都行
// 导出给 RolesGuard 使用
export const ROLES_KEY = 'roles';

// @Roles('admin') = 只有 admin 角色能访问
// @Roles('admin', 'editor') = admin 或 editor 都能访问
// 不写 @Roles() = 所有登录用户都能访问（由 RolesGuard 默认逻辑决定）
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
