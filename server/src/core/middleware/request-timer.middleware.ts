/**
 * ─────────────────────────────────────────────
 *  request-timer.middleware.ts — 请求计时中间件
 * ─────────────────────────────────────────────
 *
 * 功能性中间件：记录每个请求的耗时。
 *
 * 前端类比：axios 的请求拦截器：
 *   axios.interceptors.request.use(config => {
 *     config.meta = { startTime: Date.now() }
 *     return config
 *   })
 *   axios.interceptors.response.use(res => {
 *     console.log(`耗时: ${Date.now() - res.config.meta.startTime}ms`)
 *     return res
 *   })
 *
 * 这个中间件做的事完全一样——在请求开始时记时间，结束时打印耗时。
 *
 * 常见问题：
 *   Q: NestJS 中间件和 Guard 有什么区别？
 *   A: 中间件（Middleware）在 Guard 之前执行，做"通用的"处理，
 *      如日志、CORS、请求体解析。没有"放行/拒绝"的概念。
 *      Guard 可以"拒绝"请求（返回 403/401）。
 *
 *   Q: 为什么用 @Injectable()？
 *   A: 类式中间件也是 DI 管理的，所以也要 @Injectable()。
 *
 *   Q: 为什么在 app.module.ts 里用 configure() 注册，而不是在 main.ts 里？
 *   A: 模块级别的中间件可以用 configure() 方法精确控制
 *      "哪些路径"应用这个中间件。全局的则用 app.use() 注册。
 */

import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
// implements NestMiddleware：这个类必须实现 use 方法
export class RequestTimerMiddleware implements NestMiddleware {
  // Logger 是 NestJS 自带的日志工具
  private readonly logger = new Logger('HTTP');

  // use 方法：中间件的核心处理逻辑
  // req: 请求对象  res: 响应对象  next: 调用下一个中间件/处理程序
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();  // 记录请求开始时间

    // res.on('finish')：响应完成后触发的回调
    // 类比前端的 XMLHttpRequest 的 onload 事件
    res.on('finish', () => {
      const duration = Date.now() - start;
      this.logger.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
    });

    next();  // 调用下一个中间件或处理程序
  }
}
