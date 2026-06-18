/**
 * ─────────────────────────────────────────────
 *  http-exception.filter.ts — 全局异常过滤器
 * ─────────────────────────────────────────────
 *
 * 前端类比：axios 响应拦截器里的 error 统一处理。
 *
 * 想象你的前端项目里有个 axios 拦截器：
 *   axios.interceptors.response.use(
 *     res => res,
 *     error => {
 *       // 所有错误的统一处理在这里
 *       return { code: error.status, message: error.message }
 *     }
 *   )
 *
 * 这个文件做的事情一模一样——捕获所有异常，统一返回格式。
 *
 * 常见问题：
 *   Q: @Catch() 是啥？
 *   A: 告诉 NestJS "这个过滤器要捕获什么类型的异常"。
 *      @Catch() 空括号 = 捕获所有异常
 *      @Catch(HttpException) = 只捕获 HTTP 异常
 *
 *   Q: implements ExceptionFilter 呢？
 *   A: 实现"异常过滤器"接口。相当于签了个合同说：
 *      "我这个类一定有一个 catch 方法"。
 *      这样 NestJS 就知道在发生异常时调用这个类的 catch 方法。
 *
 *   Q: ArgumentsHost 是什么？
 *   A: 它封装了当前请求的上下文，包括 request、response 等。
 *      就是用来拿到"当前是哪个请求出了问题"的信息。
 */

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
// Request 和 Response 是 Express 的类型
import { Request, Response } from 'express';

@Catch() // 捕获所有异常
// implements ExceptionFilter: 规定这个类必须有 catch 方法
export class AllExceptionsFilter implements ExceptionFilter {
  // Logger 是 NestJS 自带的日志工具，类似 console.log 但更专业
  // AllExceptionsFilter.name 就是字符串 "AllExceptionsFilter"
  private readonly logger = new Logger(AllExceptionsFilter.name);

  // catch 方法是异常发生时的"回调函数"
  // exception: 抛出的异常对象（可能是任何类型，所以是 unknown）
  // host: 当前请求的上下文
  catch(exception: unknown, host: ArgumentsHost) {
    // switchToHttp() 切换到 HTTP 上下文（NestJS 也支持 WebSocket、RPC）
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 默认状态码 500（服务器内部错误）
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    // 默认错误消息
    let message: string | string[] = '服务器内部错误';

    // 判断异常类型
    if (exception instanceof HttpException) {
      // HttpException 是 NestJS 内置的异常基类
      // NotFoundException、ConflictException、BadRequestException 等
      // 都是它的子类，所以这里能统一处理
      status = exception.getStatus();
      const res = exception.getResponse();
      // 异常信息可能是字符串 "Not Found"，也可能是对象 { message: "xxx" }
      message =
        typeof res === 'string'
          ? res
          : (res as { message?: string | string[] }).message || message;
    } else if (exception instanceof Error) {
      // 非 HTTP 异常（如数据库连接失败、代码运行时错误等）
      // 记录完整堆栈信息方便排查
      this.logger.error(`未捕获异常: ${exception.message}`, exception.stack);
    }

    // class-validator 校验失败时 message 可能是个数组
    // 比如同时传了 username 和 email 都错误，返回 ["用户名不能为空", "邮箱格式不正确"]
    // 取第一条就够了，全列出来前端用户也看不懂
    const displayMessage = Array.isArray(message) ? message[0] : message;

    // 返回统一的 JSON 格式
    response.status(status).json({
      code: status,
      message: displayMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
