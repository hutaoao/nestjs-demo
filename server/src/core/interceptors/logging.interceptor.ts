/**
 * ─────────────────────────────────────────────
 *  logging.interceptor.ts — 请求日志拦截器
 * ─────────────────────────────────────────────
 *
 * 前端类比：axios 请求/响应拦截器。
 *
 *   axios.interceptors.request.use(config => {
 *     console.log('请求开始:', config.url)
 *     return config
 *   })
 *   axios.interceptors.response.use(res => {
 *     console.log('请求结束:', res.status)
 *     return res
 *   })
 *
 * Interceptor 就是干这个的——在请求处理"之前"和"之后"插一脚。
 *
 * 常见问题：
 *   Q: implements NestInterceptor 是啥？
 *   A: 拦截器必须实现 NestInterceptor 接口，有 intercept 方法。
 *
 *   Q: Observable 和 RxJS 咋回事？
 *   A: Observable 是"可观察对象"，类似 Promise 但更强大。
 *      next.handle() 返回一个 Observable，代表"继续处理请求"。
 *      你可以：
 *      - 在它前面做事（请求前）
 *      - 用 .pipe(tap(...)) 在它后面做事（请求后）
 *      - 甚至修改返回的数据
 *
 *   Q: pipe 和 tap 是啥？
 *   A: pipe 是 RxJS 的"管道"方法，像数组的 .map()。
 *      tap 是"偷看"操作，可以在不修改数据的情况下做点事情。
 *      这里用来在请求完成后打印日志，不影响返回给前端的数据。
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
// Observable 和 tap 来自 RxJS（一套处理异步事件的工具库）
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  // Logger 是 NestJS 自带的日志工具
  // 参数 'HTTP' 是日志的上下文名称，便于区分日志来源
  private readonly logger = new Logger('HTTP');

  // intercept 方法：拦截请求
  // context: 当前请求的上下文
  // next: 下一个处理函数，调用 next.handle() 继续处理请求
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // ── 请求前 ──
    const request = context.switchToHttp().getRequest();
    const { method, url } = request; // 解构出 HTTP 方法和 URL
    const now = Date.now(); // 记录当前时间

    // ── 继续处理请求，然后在完成后执行回调 ──
    // next.handle() 返回一个 Observable，代表"请求处理的结果"
    return next.handle().pipe(
      // tap: 在 Observable 完成时执行，不影响返回数据
      tap(() => {
        // ── 请求后 ──
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        // 打印日志：GET /users/1 → 200 (12ms)
        this.logger.log(
          `${method} ${url} → ${statusCode} (${Date.now() - now}ms)`,
        );
      }),
    );
  }
}
