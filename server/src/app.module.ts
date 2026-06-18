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
import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
// 新增模块
import { AuthModule } from './modules/auth/auth.module';
import { TagsModule } from './modules/tags/tags.module';
import { DynamicConfigModule } from './modules/dynamic-config/dynamic-config.module';
import { FilesModule } from './modules/files/files.module';
// 生命周期演示
import { LifecycleDemoService } from './modules/demo/demo-lifecycle.service';
// 中间件
import { RequestTimerMiddleware } from './core/middleware/request-timer.middleware';
// configuration 是 config/configuration.ts 导出的配置工厂函数
import configuration from './config/configuration';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './core/database/database.service';

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
    // ── 新增模块 ──
    AuthModule,             // 🔐 认证授权模块（JWT + Guard + 角色）
    TagsModule,             // 🏷️ 标签 CRUD 模块
    DynamicConfigModule.forRoot({ path: '.env' }),  // 🧩 动态模块演示
    FilesModule,            // 📁 文件上传模块
  ],
  // providers: 注册 Service（提供业务逻辑的类）
  providers: [
    // ── 🔄 生命周期事件演示服务 ──
    LifecycleDemoService,

    // ── ⚙️ 自定义提供者（useFactory） ──
    // useFactory 模式：在运行时通过工厂函数动态创建 provider 的值
    // 前端类比：Vue 的 computed 属性——依赖其他值计算得出
    // 这里我们把应用配置作为一个 provider 注册
    {
      provide: 'APP_CONFIG',  // provider 的 token（注入时用的 key）
      // useFactory: 工厂函数，返回值会被注册为 provider
      useFactory: (configService: ConfigService) => ({
        port: configService.get<number>('port', 3000),
        environment: process.env.NODE_ENV || 'development',
        name: 'NestJS Demo',
      }),
      inject: [ConfigService],  // 工厂函数依赖的 provider
    },

    // ── 🔄 异步提供者（async useFactory） ──
    // async useFactory 模式：在模块初始化时异步执行，完成后才完成模块加载
    // 适合做：启动时检查数据库连接、加载远程配置、预热缓存
    {
      provide: 'DATABASE_HEALTH',  // provider token
      useFactory: async (db: DatabaseService) => {
        try {
          // 异步执行 SQL 查询，检查数据库是否连通
          await db.$queryRaw`SELECT 1`;
          return { connected: true, timestamp: new Date() };
        } catch {
          return { connected: false, timestamp: new Date() };
        }
      },
      inject: [DatabaseService],
    },
  ],
})
// 实现 NestModule 接口：为了配置中间件
export class AppModule implements NestModule {
  // configure() 方法：注册中间件
  // NestJS 在模块初始化时会自动调用这个方法
  // consumer.apply(Middleware).forRoutes('*') 把所有路由都应用这个中间件
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestTimerMiddleware)  // 应用请求计时中间件
      .forRoutes('*');                 // 对所有路由生效
  }
}
