/**
 * ─────────────────────────────────────────────
 *  tags.service.ts — 标签业务服务
 * ─────────────────────────────────────────────
 *
 * 最简单的 CRUD——没有外键约束、没有额外校验、没有关联查询。
 * 作为"授权"概念的演示场景：创建/删除需要 admin 角色。
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly db: DatabaseService) {}

  // ── 创建标签（需要 admin 角色） ──
  create(dto: CreateTagDto) {
    // Prisma 会自动处理唯一约束（Tag.name 是 @unique）
    // 如果重复了会抛 P2002 错误，被全局 Filter 捕获
    return this.db.tag.create({ data: dto });
  }

  // ── 所有标签列表 ──
  findAll() {
    return this.db.tag.findMany({
      include: { _count: { select: { posts: true } } }, // 附带该标签被多少文章使用
    });
  }

  // ── 单个标签详情 ──
  async findOne(id: number) {
    const tag = await this.db.tag.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    });
    if (!tag) throw new NotFoundException(`标签 #${id} 不存在`);
    return tag;
  }

  // ── 删除标签（需要 admin 角色） ──
  async remove(id: number) {
    try {
      return await this.db.tag.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`标签 #${id} 不存在`);
    }
  }
}
