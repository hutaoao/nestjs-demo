/**
 * ─────────────────────────────────────────────
 *  posts.service.ts — 文章业务服务
 * ─────────────────────────────────────────────
 *
 * 和 UsersService 的区别：
 *   UsersService 操作的是 db.user 表
 *   PostsService 操作的是 db.post 表
 *   PostsService 在创建文章时多了"校验作者是否存在"的逻辑
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../core/database/database.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class PostsService {
  constructor(private readonly db: DatabaseService) {}

  // ── 创建文章 ──
  // 在创建之前先校验作者是否存在（外键约束）
  // 支持可选 tagIds 关联标签
  async create(dto: CreatePostDto) {
    // 先查询作者是否存在
    const author = await this.db.user.findUnique({
      where: { id: dto.authorId },
    });
    if (!author) {
      throw new NotFoundException(`用户 #${dto.authorId} 不存在`);
    }

    // 解构出 tagIds，剩余的作为文章数据
    const { tagIds, ...postData } = dto;

    // 作者存在，继续创建文章（如果有 tagIds 则同时创建标签关联）
    return this.db.post.create({
      data: {
        ...postData,
        // 如果传了 tagIds，创建 PostTag 关联记录
        ...(tagIds && tagIds.length > 0
          ? {
              tags: {
                create: tagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
      },
      // 返回时带上标签信息
      include: { author: true, tags: { include: { tag: true } } },
    });
  }

  // ── 文章列表（分页） ──
  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const [data, total] = await Promise.all([
      this.db.post.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { author: true, tags: { include: { tag: true } } },
      }),
      this.db.post.count(),
    ]);
    return { data, total, page, limit };
  }

  // ── 文章详情 ──
  async findOne(id: number) {
    const post = await this.db.post.findUnique({
      where: { id },
      include: { author: true, tags: { include: { tag: true } } },
    });
    if (!post) throw new NotFoundException(`文章 #${id} 不存在`);
    return post;
  }

  // ── 更新文章 ──
  async update(id: number, dto: UpdatePostDto) {
    const { tagIds, ...postData } = dto;
    try {
      return await this.db.post.update({
        where: { id },
        data: {
          ...postData,
          ...(tagIds !== undefined
            ? {
                tags: {
                  deleteMany: {},
                  create: tagIds.map((tagId) => ({ tagId })),
                },
              }
            : {}),
        },
        include: { author: true, tags: { include: { tag: true } } },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`文章 #${id} 不存在`);
      }
      throw error;
    }
  }

  // ── 删除文章 ──
  async remove(id: number) {
    try {
      return await this.db.post.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`文章 #${id} 不存在`);
      }
      throw error;
    }
  }
}
