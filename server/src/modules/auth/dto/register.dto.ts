/**
 * ─────────────────────────────────────────────
 *  register.dto.ts — 注册请求体 DTO
 * ─────────────────────────────────────────────
 *
 * DTO（Data Transfer Object）定义"前端发来的数据长什么样"。
 * 这里的装饰器（@IsString、@IsEmail 等）就是"校验规则"。
 *
 * 前端类比：相当于 zod/yup 定义的 schema：
 *   const registerSchema = z.object({
 *     username: z.string().min(3),
 *     email: z.string().email(),
 *     password: z.string().min(6),
 *   })
 */

import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'alice', description: '用户名（唯一）' })
  @IsString()                    // 必须是字符串
  @MinLength(2)                  // 至少 2 个字符
  username!: string;

  @ApiProperty({ example: 'alice@example.com', description: '邮箱（唯一）' })
  @IsEmail()                     // 必须是合法的邮箱格式
  email!: string;

  @ApiProperty({ example: '123456', description: '密码（至少 6 位）' })
  @IsString()                    // 必须是字符串
  @MinLength(6)                  // 至少 6 个字符
  password!: string;
}
