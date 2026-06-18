/**
 * ─────────────────────────────────────────────
 *  tags.module.ts — 标签模块
 * ─────────────────────────────────────────────
 *
 * 最简单的独立模块——只有 Controller + Service。
 * 不需要 imports 其他模块，因为 DatabaseService 是 @Global 的。
 */

import { Module } from '@nestjs/common';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

@Module({
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
