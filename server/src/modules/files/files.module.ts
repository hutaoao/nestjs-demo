/**
 * ─────────────────────────────────────────────
 *  files.module.ts — 文件上传模块
 * ─────────────────────────────────────────────
 *
 * 最简模块——只有 Controller，不需要 Service。
 * 因为文件上传的逻辑非常简单：用 Multer 解析文件，
 * 然后在 Controller 中直接返回文件信息即可。
 */

import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';

@Module({
  controllers: [FilesController],
})
export class FilesModule {}
