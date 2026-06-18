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
  async create(dto: CreatePostDto) {
    // 先查询作者是否存在
    const author = await this.db.user.findUnique({
      where: { id: dto.authorId },
    });
    if (!author) {
      // 如果作者不存在，直接抛 404 错误
      // 前端可以展示："你引用的用户不存在"
      throw new NotFoundException(`用户 #${dto.authorId} 不存在`);
    }
    // 作者存在，继续创建文章
    return this.db.post.create({ data: dto });
  }

  // ── 文章列表（分页） ──
  findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    return this.db.post.findMany({
      skip: (page - 1) * limit,
      take: limit,
      // include: 关联查询作者信息
      // 文章返回时自动带上 author 对象（包含作者的用户名、邮箱等）
      include: { author: true },
    });
  }

  // ── 文章详情 ──
  async findOne(id: number) {
    const post = await this.db.post.findUnique({
      where: { id },
      // 也带上作者信息
      include: { author: true },
    });
    if (!post) throw new NotFoundException(`文章 #${id} 不存在`);
    return post;
  }

  // ── 更新文章 ──
  async update(id: number, dto: UpdatePostDto) {
    try {
      return await this.db.post.update({
        where: { id },
        data: dto,
        // 更新后也返回作者信息
        include: { author: true },
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
