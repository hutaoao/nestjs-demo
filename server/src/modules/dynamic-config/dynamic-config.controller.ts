/**
 * ─────────────────────────────────────────────
 *  dynamic-config.controller.ts — 动态模块演示控制器
 * ─────────────────────────────────────────────
 *
 * 这个控制器演示了通过动态模块注入的配置值。
 * DynamicConfigModule.forRoot({ path: '.env' }) 在注册时
 * 把 path 值传入，Controller 通过 DynamicConfigService 获取。
 */

import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DynamicConfigService } from './dynamic-config.service';

@ApiTags('Demo')
@Controller('dynamic-config')
export class DynamicConfigController {
  constructor(private readonly configService: DynamicConfigService) {}

  @Get()
  @ApiOperation({ summary: '获取动态模块配置（forRoot 演示）' })
  getConfig() {
    return this.configService.getConfig();
  }
}
