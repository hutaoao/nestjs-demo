/**
 * ─────────────────────────────────────────────
 *  users.service.ts — 用户业务服务
 * ─────────────────────────────────────────────
 *
 * Service 是"写业务逻辑"的地方。Controller 只负责路由和参数提取，
 * 真正做事（增删改查、校验、异常处理）都在这里。
 *
 * 常见问题：
 *   Q: @Injectable() 是啥？
 *   A: 标记这个类可以被 NestJS 的 DI（依赖注入）容器管理。
 *      加上后，Controller 的构造函数里就能自动拿到 UsersService 的实例。
 *
 *   Q: constructor(private readonly db: DatabaseService) {}
 *   A: 这是依赖注入。NestJS 自动创建 DatabaseService 实例并传进来。
 *      你不需要自己 new DatabaseService()，NestJS 帮你做了。
 *
 *   Q: async/await 为什么这么常用？
 *   A: 数据库操作是异步的（查询需要时间），所以要用 await 等结果。
 *      方法标记为 async 表示"这个方法返回一个 Promise"。
 *
 *   Q: PrismaClientKnownRequestError 是啥？
 *   A: Prisma 操作失败时抛出的"已知错误"，code 属性是错误码：
 *      - P2002: 唯一约束冲突（比如用户名已存在）
 *      - P2025: 记录不存在（比如更新不存在的用户）
 */

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../core/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class UsersService {
  // db: DatabaseService 依赖注入
  // 所有对数据库的操作都通过 this.db 来做
  constructor(private readonly db: DatabaseService) {}

  // ── 创建用户 ──
  // async: 异步方法，返回 Promise
  async create(dto: CreateUserDto) {
    try {
      // password 在 CreateUserDto 中是可选的（string | undefined），
      // 但 Prisma UserCreateInput.password 要求 string（不可为 undefined）。
      // 解构时兜底为空字符串，避免类型不匹配。
      const { password = '', ...userData } = dto;
      // db.user.create: Prisma 的"创建"方法
      // PrismaClient 会根据 schema.prisma 自动生成 user、post 等属性
      return await this.db.user.create({
        data: { ...userData, password },
      });
    } catch (error) {
      // 捕获 Prisma 的已知错误
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // P2002: unique constraint violation（唯一约束冲突）
        // 比如用户注册时用了已存在的用户名或邮箱
        throw new ConflictException('用户名或邮箱已存在');
      }
      // 其他未知错误，继续往上抛
      throw error;
    }
  }

  // ── 用户列表（分页） ──
  findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    return this.db.user.findMany({
      skip: (page - 1) * limit, // 跳过前面多少条
      take: limit,               // 取多少条
      // include: 关联查询，把该用户的所有文章也查出来
      include: { posts: true },
    });
  }

  // ── 用户详情 ──
  async findOne(id: number) {
    const user = await this.db.user.findUnique({
      where: { id },
      include: { posts: true },
    });
    // 用户不存在 → 抛 NotFoundException → 全局 Filter 捕获后返回 404
    if (!user) throw new NotFoundException(`用户 #${id} 不存在`);
    return user;
  }

  // ── 更新用户 ──
  async update(id: number, dto: UpdateUserDto) {
    try {
      return await this.db.user.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ConflictException('用户名或邮箱已存在');
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(`用户 #${id} 不存在`);
        }
      }
      throw error;
    }
  }

  // ── 删除用户 ──
  async remove(id: number) {
    try {
      return await this.db.user.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`用户 #${id} 不存在`);
      }
      throw error;
    }
  }
}
