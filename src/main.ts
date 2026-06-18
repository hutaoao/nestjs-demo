/**
 * ─────────────────────────────────────────────
 *  main.ts — 应用入口
 * ─────────────────────────────────────────────
 * 这个文件是 NestJS 应用的启动入口。类比前端的 index.html + main.js，
 * 浏览器打开时先加载它，NestJS run 起来也是先执行这里。
 *
 * 做了四件事：
 * 1. 创建 NestJS 应用实例（new Vue() 类似）
 * 2. 注册全局插件（像 Vue.use() 注册全局组件）
 * 3. 配 Swagger 文档
 * 4. 监听 3000 端口（像 app.listen()）
 */

// NestFactory 是 NestJS 的"工厂函数"，专门用来创建应用实例
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// 引入根模块（相当于 Vue 的根组件 App.vue）
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/filters/http-exception.filter';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';

// bootstrap 是启动函数，async 表示异步（因为要等数据库连接等操作）
async function bootstrap() {
  // ── 创建应用 ──
  // NestFactory.create(AppModule) 做了很多事：
  // 1. 扫描 AppModule → 发现它 imports 了哪些子模块
  // 2. 递归扫描子模块 → 收集所有 Controller 和 Provider
  // 3. 构建 DI 容器 → 实例化所有 Service，处理依赖关系
  // 4. 注册路由 → 把 Controller 里的 @Get/@Post 等注册到 Express 路由
  const app = await NestFactory.create(AppModule);

  // ── 全局配置 ──

  // enableCors() | 允许跨域
  // 前端如果运行在 localhost:5173，后端在 localhost:3000
  // 不配 CORS 的话浏览器会报跨域错误
  app.enableCors();

  // useGlobalFilters() | 全局异常过滤器
  // 像前端的 axios 响应拦截器里的 error 统一处理
  // 所有 Controller 抛出的异常都会被这里捕获，统一返回格式
  app.useGlobalFilters(new AllExceptionsFilter());

  // useGlobalPipes() | 全局校验管道
  // 像前端的 yup/zod 校验，但它在后端自动执行
  // 每个请求进来，先过一遍这里的校验规则
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // 自动剔除 DTO 中没定义的字段（防止传多余字段）
      forbidNonWhitelisted: true,   // 传了未定义字段直接报 400 错误
      transform: true,              // 自动类型转换，如 "1" 字符串转成 1 数字
    }),
  );

  // useGlobalInterceptors() | 全局拦截器
  // 像前端的路由守卫 beforeEach / afterEach
  // 每个请求经过这里，一个负责序列化，一个负责打日志
  app.useGlobalInterceptors(
    // ClassSerializerInterceptor: 配合 @Exclude() 装饰器使用
    // 比如用户表有 password 字段，在返回前自动隐藏
    new ClassSerializerInterceptor(app.get(Reflector)),
    // LoggingInterceptor: 打印每个请求的方法、URL、耗时
    new LoggingInterceptor(),
  );

  // ── Swagger API 文档 ──
  // 相当于自动生成的前端 API 文档页面
  // 启动后访问 http://localhost:3000/api 查看
  const config = new DocumentBuilder()
    .setTitle('NestJS Demo API')
    .setDescription('一个 NestJS 学习项目，包含 User + Post CRUD 接口')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // ── 启动服务器 ──
  await app.listen(3000);
}

// void 表示"我知道这个函数返回 Promise，但我主动忽略它"
// 不加 void 的话 ESLint 会警告你忘了 await
void bootstrap();
