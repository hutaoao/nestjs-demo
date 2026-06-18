/**
 * ─────────────────────────────────────────────
 *  users.controller.ts — 用户控制器
 * ─────────────────────────────────────────────
 *
 * 前端类比：前端的路由配置表。
 *
 * 你在前端写过类似的东西：
 *   router.get('/users', UserList)
 *   router.post('/users', createUser)
 *   router.get('/users/:id', getUserDetail)
 *
 * Controller 就是干这个的，只不过用装饰器（@Get、@Post）来定义路由。
 *
 * 核心原则：Controller 只做三件事——
 *   1. 定义路由（URL 和方法）
 *   2. 提取参数（从 URL、请求体、查询字符串）
 *   3. 调用 Service 并返回结果
 * 不写任何业务逻辑（if/else/数据库操作）——那是 Service 的事。
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';

// @ApiTags('Users') — Swagger 文档的分组标签
@ApiTags('Users')
// @Controller('users') — 设置路由前缀
// 相当于 Express 的: const router = Router({ prefix: '/users' })
// 下面所有路由都会自动加上 /users 前缀
@Controller('users')
export class UsersController {
  // 构造函数：依赖注入 UsersService
  // NestJS 自动创建 UsersService 实例并传进来
  constructor(private readonly usersService: UsersService) {}

  // ── POST /users 创建用户 ──
  @Post()
  @ApiOperation({ summary: '创建用户' })
  // @Body() dto: CreateUserDto
  //   @Body() —— 从请求体中提取数据
  //   dto: CreateUserDto —— 数据需要用 CreateUserDto 类来校验
  //   前端 POST 发送的 JSON 自动映射到 dto 对象
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // ── GET /users 用户列表（分页） ──
  @Get()
  @ApiOperation({ summary: '用户列表（分页）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  // @Query() pagination: PaginationDto
  //   @Query() —— 从查询字符串中提取数据（?page=1&limit=10）
  //   PaginationDto —— 自动校验 page≥1, 1≤limit≤100
  findAll(@Query() pagination: PaginationDto) {
    return this.usersService.findAll(pagination);
  }

  // ── GET /users/:id 用户详情 ──
  @Get(':id')
  @ApiOperation({ summary: '用户详情' })
  // @Param('id', ParseIntPipe) id: number
  //   @Param('id') —— 从 URL 参数中提取 :id
  //   ParseIntPipe —— 内置管道，把字符串 "1" 转成数字 1
  //   如果传了 "abc" → 自动返回 400 Bad Request
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // ── PATCH /users/:id 更新用户 ──
  @Patch(':id')
  @ApiOperation({ summary: '更新用户' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // ── DELETE /users/:id 删除用户 ──
  @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT) — 设置响应状态码为 204
  // 204 No Content 表示"删除成功，没有返回数据"
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除用户' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
