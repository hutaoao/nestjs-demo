/**
 * ─────────────────────────────────────────────
 *  create-post.dto.ts — 创建文章请求体 DTO
 * ─────────────────────────────────────────────
 *
 * 跟 CreateUserDto 相比多了两个新东西：
 *
 * 1. @IsOptional()
 *    content 字段是可选的，用户可以不传。
 *    @IsOptional() 的意思是：传了我就校验，不传就算了。
 *
 * 2. @IsInt() + @IsPositive()
 *    authorId 必须是"正整数"。因为它是 User 表的外键，
 *    不能是小数（1.5），也不能是负数（-1）。
 *
 * 校验执行顺序：
 *   如果前端传了 { title: "test", authorId: "abc" }
 *   1. @IsString() → title 通过
 *   2. @IsString() → content 没传，但有 @IsOptional，跳过
 *   3. @IsInt() → "abc" 不是整数 → 返回 400
 *   装饰器是自上而下依次执行的。
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: '文章标题', example: 'NestJS 入门教程' })
  @IsString()
  @IsNotEmpty({ message: '文章标题不能为空' })
  title!: string;

  @ApiPropertyOptional({ description: '文章内容', example: '这是一篇教程...' })
  @IsString()
  @IsOptional()    // ← 可选字段：传了校验，不传拉倒
  content?: string; // ? 类型标记为可选

  @ApiProperty({ description: '作者 ID', example: 1 })
  @IsInt()         // ← 必须是整数（不能传 "abc" 或 1.5）
  @IsPositive()    // ← 必须大于 0
  authorId!: number;

  @ApiPropertyOptional({ description: '标签 ID 列表', example: [1, 2] })
  @IsArray()
  @IsInt({ each: true })  // ← 数组中的每个元素都必须是整数
  @IsOptional()
  tagIds?: number[];
}
