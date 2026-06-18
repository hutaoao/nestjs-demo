/**
 * ─────────────────────────────────────────────
 *  dynamic-config.service.ts — 动态模块演示服务
 * ─────────────────────────────────────────────
 *
 * 这个服务通过构造函数注入了一个"配置路径"。
 * 这个路径是由 DynamicConfigModule.forRoot({ path: '.env' })
 * 在注册模块时动态传入的。
 *
 * 这就是"动态模块"的核心思想：
 *   普通模块：配置写死在模块内部
 *   动态模块：配置由使用方在 import 时传入
 */

import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DynamicConfigService {
  // @Inject('CONFIG_PATH') 注入由 DynamicConfigModule.forRoot() 注册的 provider
  // CONFIG_PATH 的值是调用 forRoot({ path: ... }) 时传入的
  constructor(
    @Inject('CONFIG_PATH') private readonly configPath: string,
  ) {}

  // 返回配置信息，展示动态传入的值
  getConfig() {
    return {
      configPath: this.configPath,
      message: '这个配置路径是由 DynamicConfigModule.forRoot() 动态传入的',
    };
  }
}
