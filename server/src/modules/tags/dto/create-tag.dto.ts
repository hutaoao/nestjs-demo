/**
 * ─────────────────────────────────────────────
 *  create-tag.dto.ts — 创建标签 DTO
 * ─────────────────────────────────────────────
 *
 * 标签只需要一个 name 字段。简单到极致。
 */

import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'TypeScript', description: '标签名称（唯一）' })
  @IsString()
  @MinLength(1)
  name!: string;
}
