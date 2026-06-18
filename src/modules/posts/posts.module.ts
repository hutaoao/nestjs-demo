/**
 * ─────────────────────────────────────────────
 *  posts.module.ts — 文章模块
 * ─────────────────────────────────────────────
 *
 * 结构与 UsersModule 完全一样。
 * 想添加新业务模块时，照着这个模板复制一份改个名即可。
 */

import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
