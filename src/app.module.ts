/**
 * ─────────────────────────────────────────────
 *  app.module.ts — 根模块（类似 Vue 的 App.vue）
 * ─────────────────────────────────────────────
 *
 * 类比前端：
 *   @Module  ≈  Vue 组件里的 components: { ... } 注册子组件
 *   imports  ≈  引入其他模块（像 import 组件后还要在 components 里注册）
 *   exports  ≈  把模块里的东西暴露给外面用
 *   providers ≈  注册 Service（像 provide/inject）
 *   controllers ≈ 注册路由处理器
 *
 * 模块是 NestJS 的最小组织单元。每个功能都是一个模块，
 * 根模块就是把这些模块"组装"在一起的地方。
 */

// @Module 是一个装饰器（类似 Vue @Component），
// 它告诉 NestJS："这个类是一个模块，它的配置如下"
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
// configuration 是 config/configuration.ts 导出的配置工厂函数
import configuration from './config/configuration';

// ── @Module 装饰器 ──
// 参数是一个对象，属性都是数组，因为可以注册多个东西
// 类比 Vue: components: { UserList, PostList } 也是数组/对象
@Module({
  // imports: 导入其他模块。数组表示可以导入多个
  // 这些模块里的 exports 会自动被当前模块可用
  imports: [
    // ConfigModule.forRoot() 是 NestJS 官方配置模块
    // isGlobal: true 表示全局可用，所有模块无需导入就能注入 ConfigService
    // load: [configuration] 加载我们自定义的配置工厂
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    DatabaseModule,  // 数据库连接模块
    UsersModule,     // 用户 CRUD 模块
    PostsModule,     // 文章 CRUD 模块
  ],
  // controllers: 注册控制器（处理 HTTP 请求的类）
  // 当前根模块没有自己的控制器（因为删掉了 Hello World 样板）
  // controllers: [],

  // providers: 注册 Service（提供业务逻辑的类）
  // 当前根模块没有自己的 Service
  // providers: [],
})
// export class 导出这个模块类，让 main.ts 能 import 它
// 类名 AppModule 是约定俗成的，NestJS CLI 生成项目时默认这个名字
export class AppModule {}
