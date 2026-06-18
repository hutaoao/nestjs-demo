/**
 * ─────────────────────────────────────────────
 *  users.module.ts — 用户模块
 * ─────────────────────────────────────────────
 *
 * 每个业务功能一个模块，模块是 NestJS 的基本组织单元。
 *
 * @Module 配置说明：
 *   controllers: [UsersController]  → 这个模块有哪些路由处理器
 *   providers: [UsersService]       → 这个模块有哪些可注入的服务
 *
 * 没有写 imports 是因为 DatabaseModule 是 @Global 的，
 * 不需要在这里导入，UsersService 的构造函数里直接注入 DatabaseService 即可。
 */

import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  // controllers: 数组，可以注册多个 Controller
  // 每个 Controller 负责一组路由（如 /users 相关的所有路由）
  controllers: [UsersController],
  // providers: 数组，注册这个模块需要的 Service
  // NestJS 会自动创建 UsersService 的实例，并处理它的依赖（DatabaseService）
  providers: [UsersService],
})
// export class 导出这个类，让 app.module.ts 可以 import 它
export class UsersModule {}
