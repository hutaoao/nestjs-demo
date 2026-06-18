/**
 * ─────────────────────────────────────────────
 *  create-user.dto.ts — 创建用户请求体 DTO
 * ─────────────────────────────────────────────
 *
 * 前端类比：TypeScript 接口 + yup 校验的结合体。
 *
 * 在前端你可能这样写过：
 *   interface CreateUserForm {
 *     username: string;  // 必填
 *     email: string;     // 必填，邮箱格式
 *   }
 *
 *   const schema = yup.object({
 *     username: yup.string().required('用户名不能为空'),
 *     email: yup.string().email('邮箱格式不正确').required(),
 *   });
 *
 * DTO 把"类型定义"和"校验规则"合二为一。
 * 每个装饰器就是一条校验规则：
 *   @IsString()         → 必须是字符串
 *   @IsNotEmpty()       → 不能为空
 *   @IsEmail()          → 必须是邮箱格式
 *   @ApiProperty()      → 在 Swagger 文档中显示这个字段
 *
 * ! 号（非空断言）：
 *   TypeScript 严格模式下，属性必须在构造函数里赋值。
 *   但我们不是自己 new 这个类，而是由 class-transformer 在接收到请求时
 *   自动把 JSON 转成这个类的实例。所以加上 ! 告诉 TS：
 *   "相信我，这个属性一定会有值的"。
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'zhangsan' })
  @IsString()                               // 必须是字符串
  @IsNotEmpty({ message: '用户名不能为空' })  // 不能为空字符串
  username!: string;                         // ! 非空断言

  @ApiProperty({ description: '邮箱', example: 'zhangsan@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' }) // 必须是合法邮箱
  email!: string;

  @ApiPropertyOptional({ description: '密码', example: '123456' })
  @IsString()
  @IsOptional()                              // POST /users 可选，auth/register 会用
  password?: string;
}
