/**
 * ─────────────────────────────────────────────
 *  public.decorator.ts — @Public() 自定义装饰器
 * ─────────────────────────────────────────────
 *
 * 默认所有路由都需要 JWT 认证。加上 @Public() 的路由可以跳过认证。
 *
 * 前端类比：
 *   // Vue Router 里，有的页面需要登录，有的不需要
 *   { path: '/login', meta: { requiresAuth: false } }
 *   { path: '/dashboard', meta: { requiresAuth: true } }
 *
 *  @Public() 就是这里的 meta: { requiresAuth: false }。
 *
 * 常见问题：
 *   Q: 为什么不需要 @Public 的路由默认就是需要认证的？
 *   A: 因为我们会在 jwt-auth.guard.ts 中做判断：
 *      如果方法上有 @Public() 标记，直接放行；
 *      如果没有，才去验证 JWT Token。
 */

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// @Public() 标记的路由不需要 JWT 认证
// 使用方式：在 Controller 的方法上添加 @Public()
// 比如：@Public() @Get('public-data') → 任何人都能访问
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
