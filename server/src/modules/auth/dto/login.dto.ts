/**
 * ─────────────────────────────────────────────
 *  login.dto.ts — 登录请求体 DTO
 * ─────────────────────────────────────────────
 *
 * 比 RegisterDto 少了 username，只需要 email + password。
 * 前端用户登录时通常只填邮箱和密码。
 */

import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'alice@example.com', description: '注册时填的邮箱' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456', description: '注册时填的密码' })
  @IsString()
  password!: string;
}
