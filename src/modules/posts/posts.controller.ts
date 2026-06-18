/**
 * ─────────────────────────────────────────────
 *  posts.controller.ts — 文章控制器
 * ─────────────────────────────────────────────
 *
 * 与 UsersController 结构一模一样，只是把 user 换成了 post。
 * 这就是 NestJS 模块化的好处：模板代码一致，熟悉一个就熟悉了全部。
 *
 * 装饰器速查：
 *   @Get()     → GET 请求（获取数据）
 *   @Post()    → POST 请求（创建数据）
 *   @Patch()   → PATCH 请求（部分更新）
 *   @Delete()  → DELETE 请求（删除数据）
 *   @HttpCode(204) → 设置响应状态码
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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // ── POST /posts 创建文章 ──
  @Post()
  @ApiOperation({ summary: '创建文章' })
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  // ── GET /posts 文章列表（分页） ──
  @Get()
  @ApiOperation({ summary: '文章列表（分页）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() pagination: PaginationDto) {
    return this.postsService.findAll(pagination);
  }

  // ── GET /posts/:id 文章详情 ──
  @Get(':id')
  @ApiOperation({ summary: '文章详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  // ── PATCH /posts/:id 更新文章 ──
  @Patch(':id')
  @ApiOperation({ summary: '更新文章' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto);
  }

  // ── DELETE /posts/:id 删除文章 ──
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除文章' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }
}
