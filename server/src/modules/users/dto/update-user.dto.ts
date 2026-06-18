/**
 * ─────────────────────────────────────────────
 *  update-user.dto.ts — 更新用户请求体 DTO
 * ─────────────────────────────────────────────
 *
 * 更新接口的特点是："所有字段都是可选的"。
 * 因为用户可能只想改 username，也可能只想改 email。
 *
 * PartialType 就是干这个的——
 * 它把 CreateUserDto 里的所有字段都变成可选（加上 ? 标记）。
 * 等价于你手动写：
 *   export class UpdateUserDto {
 *     username?: string;
 *     email?: string;
 *   }
 * 但用了 PartialType 就不用重复写 @IsString、@IsEmail 等校验装饰器了。
 *
 * 类似的前端工具：Partial<Type> — TypeScript 内置工具类型
 * 只是 NestJS 把它做成了"运行时也生效"的版本（@nestjs/mapped-types）。
 */

// PartialType 来自 @nestjs/mapped-types（不是 @nestjs/common）
// 它是一个"映射类型"工具，把传入的类型所有属性变成可选
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// extends PartialType(CreateUserDto)
// 继承"CreateUserDto 的可选版本"
// 效果：username?: string; email?: string;
// 且保留 @IsString、@IsEmail 等校验装饰器
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: '角色（user 或 admin）', example: 'admin' })
  @IsString()
  @IsOptional()
  role?: string;
}
