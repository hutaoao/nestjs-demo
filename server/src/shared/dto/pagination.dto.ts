/**
 * ─────────────────────────────────────────────
 *  pagination.dto.ts — 分页查询参数 DTO
 * ─────────────────────────────────────────────
 *
 * 前端类比：在输入框上用 type="number" + min="1" + max="100"。
 *
 * 这个类定义了"分页查询"请求参数的格式和校验规则。
 * 不管是 GET /users?page=1&limit=10 还是 GET /posts?page=2&limit=20，
 * 都用同一个 DTO 来校验。
 *
 * DTO（Data Transfer Object）—— 数据传输对象
 * 简单说就是："前端发过来的数据应该长什么样"的说明书。
 *
 * 每个属性上的装饰器就是"校验规则"：
 *   @IsOptional()    → 可以不传
 *   @Type(() => Number) → URL 参数是字符串，自动转成数字
 *   @IsInt()         → 必须是整数
 *   @Min(1)          → 最小值 1
 *   @Max(100)        → 最大值 100
 *   @ApiPropertyOptional() → 在 Swagger 文档里显示这个可选参数
 */

import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  // ── 页码 ──
  // 默认值 1，最小值 1
  @ApiPropertyOptional({ description: '页码', default: 1, minimum: 1 })
  @IsOptional()              // 可以不传
  @Type(() => Number)        // query 参数是字符串，自动转数字
  @IsInt()                   // 必须是整数
  @Min(1)                    // 不能小于 1
  page?: number = 1;         // ? 可选 + 默认值 1

  // ── 每页数量 ──
  // 默认 10 条，最少 1 条，最多 100 条
  @ApiPropertyOptional({
    description: '每页数量', default: 10, minimum: 1, maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
