/**
 * ─────────────────────────────────────────────
 *  update-post.dto.ts — 更新文章请求体 DTO
 * ─────────────────────────────────────────────
 *
 * 和 UpdateUserDto 一样的模式：PartialType 把 CreatePostDto 全变可选。
 * title、content、authorId 现在都是可选的。
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {}
