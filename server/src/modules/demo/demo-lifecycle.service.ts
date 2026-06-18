/**
 * ─────────────────────────────────────────────
 *  demo-lifecycle.service.ts — 生命周期事件演示
 * ─────────────────────────────────────────────
 *
 * 演示 NestJS 的两个核心生命周期钩子：
 *   1. OnModuleInit — 模块初始化后自动调用
 *   2. OnApplicationShutdown — 应用关闭时自动调用
 *
 * 前端类比：
 *   React useEffect：
 *     useEffect(() => {
 *       console.log('组件挂载')      // 对应 onModuleInit
 *       return () => {
 *         console.log('组件卸载')    // 对应 onApplicationShutdown
 *       }
 *     }, [])
 *
 * 或者 Vue 的生命周期：
 *     onMounted(() => { ... })      // 对应 onModuleInit
 *     onUnmounted(() => { ... })    // 对应 onApplicationShutdown
 *
 * 常见问题：
 *   Q: implements OnModuleInit 是啥？
 *   A: TypeScript 的"实现接口"。OnModuleInit 是 NestJS 内置的接口，
 *      它要求你有 onModuleInit() 方法。NestJS 在合适的时机自动调用它。
 *      类似 React 说"如果你有 componentDidMount 方法，挂载后我就调用它"。
 *
 *   Q: onModuleInit 和 constructor 有什么区别？
 *   A: constructor 在"类被实例化时"调用，此时 DI 还没完全准备好。
 *      onModuleInit 在"所有依赖都注入完成后"调用，此时 this.db 等已经可用。
 *
 *   Q: onApplicationShutdown 什么时候触发？
 *   A: 应用收到关闭信号时（如按 Ctrl+C、进程被 kill）。
 *      需要 main.ts 中 app.enableShutdownHooks() 才能生效。
 */

import { Injectable, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';

@Injectable()
export class LifecycleDemoService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(LifecycleDemoService.name);

  constructor() {
    // constructor：类被实例化时调用（依赖注入之前）
    // 此时 this.db 等属性还不能用——只适合初始化简单变量
    this.logger.log('构造函数执行：实例已创建');
  }

  // ── OnModuleInit ──
  // NestJS 解析完所有依赖后自动调用
  // 适合做：连接数据库、加载配置、初始化缓存等"准备工作"
  onModuleInit() {
    this.logger.log('【生命周期】onModuleInit — 模块初始化完成，所有依赖已就绪');
    // 实际项目中这里可能做：
    // - 连接外部服务（Redis、消息队列）
    // - 预加载一些数据到缓存
    // - 检查数据库连通性
  }

  // ── OnApplicationShutdown ──
  // 应用关闭时自动调用，需要 app.enableShutdownHooks() 才能生效
  // 适合做：关闭连接、释放资源、保存未完成的异步任务
  onApplicationShutdown(signal: string) {
    this.logger.log(`【生命周期】onApplicationShutdown — 应用关闭，信号: ${signal}`);
    // 实际项目中这里可能做：
    // - 关闭数据库连接（DatabaseService 已做）
    // - 关闭 Redis 连接
    // - 保存未完成的消息到队列
  }
}
