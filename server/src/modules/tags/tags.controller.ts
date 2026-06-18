/**
 * ─────────────────────────────────────────────
 *  tags.controller.ts — 标签控制器
 * ─────────────────────────────────────────────
 *
 * 演示授权（Authorization）：
 *   - GET /tags 和 GET /tags/:id → 公开访问
 *   - POST /tags 和 DELETE /tags/:id → 需要 admin 角色
 *
 * 前端类比：
 *   // 前端角色检查
 *   if (user.role !== 'admin') {
 *     // 隐藏"删除标签"按钮
 *   }
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  // ── POST /tags 创建标签（需 admin 角色） ──
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)  // 先检查 JWT，再检查角色
  @Roles('admin')                        // 只有 admin 角色能调用
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建标签（需 admin 角色）' })
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  // ── GET /tags 所有标签（公开） ──
  @Get()
  @ApiOperation({ summary: '所有标签列表（公开）' })
  findAll() {
    return this.tagsService.findAll();
  }

  // ── GET /tags/:id 标签详情（公开） ──
  @Get(':id')
  @ApiOperation({ summary: '标签详情（公开）' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.findOne(id);
  }

  // ── DELETE /tags/:id 删除标签（需 admin 角色） ──
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除标签（需 admin 角色）' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.remove(id);
  }
}
