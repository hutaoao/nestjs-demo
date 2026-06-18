/**
 * ─────────────────────────────────────────────
 *  database.service.ts — Prisma ORM 封装服务
 * ─────────────────────────────────────────────
 *
 * 这个文件是整个应用的"数据库管家"。所有对数据库的 CRUD 操作，
 * 最终都通过这个类来执行。
 *
 * 常见问题：
 *
 *   Q: @Injectable() 是什么？
 *   A: 它是 NestJS 的"可注入"标记。相当于在类上贴了个标签：
 *      "这个类可以被自动实例化并注入到其他类中"。
 *      类比 Vue 的 provide/inject，或者 React 的 Context.Provider。
 *      没加 @Injectable 的类，NestJS 不会帮你自动创建实例。
 *
 *   Q: extends PrismaClient 是啥？
 *   A: extends 是 TypeScript/JavaScript 的"继承"关键字。
 *      我们的 DatabaseService 继承了 PrismaClient 的所有功能。
 *      PrismaClient 自带 .user.create()、.post.findMany() 等方法，
 *      继承后我们的类也能直接调用这些方法。
 *
 *   Q: implements OnModuleInit, OnModuleDestroy 呢？
 *   A: implements 是"实现接口"。OnModuleInit 和 OnModuleDestroy
 *      是 NestJS 定义的生命周期"钩子"（hooks），像 React 的 useEffect。
 *      - OnModuleInit：模块初始化时自动调用 → 连接数据库
 *      - OnModuleDestroy：模块销毁时自动调用 → 断开数据库
 *
 *   Q: 构造函数里的 private readonly XXX 是啥意思？
 *   A: 这是 TypeScript 的简写语法：
 *      constructor(private readonly configService: ConfigService) {}
 *      等价于：
 *      private readonly configService: ConfigService;
 *      constructor(configService: ConfigService) {
 *        this.configService = configService;
 *      }
 *      这叫"依赖注入"（DI）—— 你不自己 new ConfigService()，
 *      NestJS 自动给你创建好并传进来。
 */

// @Injectable() 标记这个类可以被 NestJS 的 DI 系统管理
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
// ConfigService 是 @nestjs/config 提供的服务，用来读取配置
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
// PrismaPg 是 Prisma 7 的 PostgreSQL 驱动适配器
// Prisma 7 通过"适配器模式"连接不同的数据库
import { PrismaPg } from '@prisma/adapter-pg';
// pg 是 Node.js 连接 PostgreSQL 的底层驱动（类似 mysql2）
import { Pool } from 'pg';

@Injectable()
export class DatabaseService
  // extends PrismaClient: 继承 Prisma 的所有 CRUD 方法
  extends PrismaClient
  // implements: 实现生命周期钩子接口
  implements OnModuleInit, OnModuleDestroy
{
  // constructor: 构造函数
  // private readonly configService: ConfigService — 依赖注入
  // NestJS 看到这个参数，会自动创建 ConfigService 实例并传进来
  constructor(private readonly configService: ConfigService) {
    // super() 是调用父类（PrismaClient）的构造函数
    // 必须先调用 super() 才能用 this
    super({
      // adapter: 指定数据库适配器
      adapter: new PrismaPg(
        new Pool({
          // configService.getOrThrow<string>('DATABASE_URL')
          // 从配置中读取 DATABASE_URL，如果没配置直接报错
          connectionString: configService.getOrThrow<string>('DATABASE_URL'),
          // Neon 数据库要求 SSL 连接
          ssl: { rejectUnauthorized: false },
        }),
      ),
    });
  }

  // onModuleInit — 生命周期钩子：模块初始化时自动调用
  // 类比 React 的 useEffect(() => {}, [])
  // 这里做数据库连接
  //
  // 生命周期钩子执行顺序（当模块被导入时）：
  //   1. constructor → 实例化
  //   2. onModuleInit → 依赖注入完成后，自动调用
  //   3. 应用运行中...
  //   4. onApplicationShutdown → 收到关闭信号时（需 enableShutdownHooks）
  //   5. onModuleDestroy → 模块销毁时
  async onModuleInit() {
    await this.$connect();
  }

  // onModuleDestroy — 生命周期钩子：模块销毁时自动调用
  // 类比 React 的 useEffect 返回的清理函数
  // 这里断开数据库连接，防止连接泄漏
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
