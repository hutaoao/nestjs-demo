/**
 * ─────────────────────────────────────────────
 *  database.module.ts — 数据库模块
 * ─────────────────────────────────────────────
 *
 * 这个模块只有一个职责：提供 DatabaseService（数据库连接）给全应用使用。
 *
 * 常见问题：
 *   Q: @Global() 是什么？
 *   A: 标记为"全局模块"。加了 @Global 后，其他模块的 Service
 *      可以直接在构造函数里注入 DatabaseService，不需要在自己的
 *      imports 里导入 DatabaseModule。
 *
 *   Q: providers 数组是啥？
 *   A: 数组里放的是这个模块里"可被注入的服务"。
 *      举个例子：如果一个类上写着 @Injectable()，
 *      它就可以放进 providers 数组里。
 *      数组里的每一项，NestJS 都会自动创建实例并管理。
 *
 *   Q: exports 数组又是啥？
 *   A: 数组里放的是"我允许其他模块用哪些服务"。
 *      就像你的组件里定义了数据，但你决定哪些数据可以暴露给父组件用。
 *      这里 exports: [DatabaseService] 表示：其他模块想用 DatabaseService，我允许。
 *
 *   Q: 为什么 providers 和 exports 是数组？
 *   A: 因为可以放多个服务啊。比如：
 *      providers: [DatabaseService, LoggerService, MailService]
 *      一个模块可以注册很多服务。
 */

// @Global 是从 @nestjs/common 导入的"全局模块"装饰器
import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

// @Global() 写在这里，表示下面这个类（DatabaseModule）是全局模块
@Global()
// @Module() 告诉 NestJS：这个类的配置信息在括号里
@Module({
  // providers: 注册哪些服务
  // 数组的每一项都是一个 Provider（可被注入的服务）
  providers: [DatabaseService],
  // exports: 允许其他模块使用哪些服务
  exports: [DatabaseService],
})
// export class 导出这个模块类，让 app.module.ts 能导入它
export class DatabaseModule {}
