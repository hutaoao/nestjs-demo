/**
 * ─────────────────────────────────────────────
 *  current-user.decorator.ts — 自定义参数装饰器
 * ─────────────────────────────────────────────
 *
 * 前端类比：React 自定义 Hooks。
 *
 * 就像你写 useAuth()、useUser() 来封装"获取用户信息"的逻辑一样，
 * @CurrentUser() 是一个自定义参数装饰器，用来在 Controller 的参数上
 * 直接获取当前登录用户，不用在每个方法里重复写取 request.user 的代码。
 *
 * 常见问题：
 *   Q: 装饰器到底是啥？
 *   A: 装饰器就像"标签"或"贴纸"。
 *      @Get()、@Body()、@Controller() 都是装饰器。
 *      它们不改变原来的代码，只是在原代码上附加一些信息。
 *      你可以理解为：在函数/类上面贴了个便签，NestJS 看到便签就知道怎么做。
 *
 *   Q: createParamDecorator 是啥？
 *   A: NestJS 提供的一个"参数装饰器工厂"。
 *      用它创建一个自定义的参数装饰器。
 *      比如 @Body()、@Param()、@Query() 都是内置的参数装饰器，
 *      @CurrentUser() 就是我们自己造的。
 *
 *   Q: ExecutionContext 又出现了？
 *   A: 对，和 Guard/Interceptor 里的 ExecutionContext 是同一个东西。
 *      它封装了当前请求的所有上下文信息。
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// createParamDecorator 是 NestJS 提供的"装饰器工厂"
// 参数是一个回调函数，接受两个参数：
//   _data: 用户使用装饰器时传入的参数（这里没用所以叫 _）
//   ctx: 当前请求的上下文
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    // switchToHttp() 切换到 HTTP 上下文
    // getRequest() 获取 Express 的 request 对象
    const request = ctx.switchToHttp().getRequest();
    // request.user 是由 auth guard 在认证后挂载到 request 上的
    // 如果没配 auth guard，request.user 是 undefined
    return request.user;
  },
);
