/**
 * ─────────────────────────────────────────────
 *  dynamic-config.module.ts — 动态模块演示
 * ─────────────────────────────────────────────
 *
 * 演示 NestJS 最重要的模式之一：动态模块（Dynamic Module）。
 *
 * 前端类比：Vue.use(plugin, options)
 *   Vue.use(Router, { mode: 'history' })
 *   // Router 可以接收配置选项，决定怎么注册路由
 *
 * 后端类比：所有官方模块都是动态模块！
 *   TypeOrmModule.forRoot({ ... })
 *   JwtModule.registerAsync({ ... })
 *   ConfigModule.forRoot({ isGlobal: true })
 *
 * 这个模块展示了最简单的 forRoot() 模式：
 *   1. 静态方法 forRoot(options) → 接收配置
 *   2. 返回 DynamicModule → 一个带有配置的模块对象
 *   3. 内部把配置注册为 provider，Service 通过 @Inject() 获取
 *
 * 使用方式（在 app.module.ts 中）：
 *   imports: [DynamicConfigModule.forRoot({ path: '.env' })]
 */

import { DynamicModule, Module } from '@nestjs/common';
import { DynamicConfigController } from './dynamic-config.controller';
import { DynamicConfigService } from './dynamic-config.service';

// 注意：@Module({}) 是空白的！
// 因为模块的 providers 和 controllers 在 forRoot 方法中动态返回
@Module({})
export class DynamicConfigModule {
  // forRoot: 静态方法，返回一个"动态模块"
  // options: 使用方传入的配置（可以定义接口给用户更友好的类型提示）
  static forRoot(options: { path: string }): DynamicModule {
    return {
      // module: 必须是当前类名（DynamicModule）
      module: DynamicConfigModule,
      // global: true → 全局模块，其他模块无需 imports 也能注入其 provider
      global: true,
      controllers: [DynamicConfigController],  // 注册控制器
      // providers: 把 options.path 注册为 CONFIG_PATH token 的 provider
      // DynamicConfigService 通过 @Inject('CONFIG_PATH') 获取这个值
      providers: [
        {
          provide: 'CONFIG_PATH',
          useValue: options.path,  // 把传入的参数作为一个 provider 注册
        },
        DynamicConfigService,
      ],
      // exports: 让其他模块也能使用 DynamicConfigService
      exports: [DynamicConfigService],
    };
  }
}
