/**
 * ─────────────────────────────────────────────
 *  parse-id.pipe.ts — 自定义 ID 校验管道
 * ─────────────────────────────────────────────
 *
 * 前端类比：表单输入框的 onChange 事件里的数据清洗。
 *
 * 你在前端可能写过：
 *   const age = parseInt(inputValue, 10);
 *   if (isNaN(age) || age <= 0) {
 *     setError('年龄必须大于 0');
 *     return;
 *   }
 *
 * Pipe（管道）做的就是这件事——在数据到达 Controller 之前，
 * 先"洗一遍"：校验格式、转换类型、该抛错就抛错。
 *
 * 常见问题：
 *   Q: implements PipeTransform<string, number> 是啥？
 *   A: 这是一个泛型接口。PipeTransform<输入类型, 输出类型>
 *      表示：收到一个字符串，输出一个数字。
 *      跟 TypeScript 的函数签名 `(value: string) => number` 一个意思。
 *
 *   Q: transform 方法里的 parseInt 和前端一样？
 *   A: 一模一样。因为路由参数 :id 从 URL 过来时是字符串 "1"，
 *      需要转成数字 1 才能传给 Prisma 查询数据库。
 *
 *   Q: BadRequestException 是什么？
 *   A: NestJS 内置的异常类。抛出它 → 自动返回 400 Bad Request。
 *      类似后端的 throw new Error('xxx')，但 NestJS 会自动处理成 HTTP 响应。
 */

import {
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  // transform: 管道的核心方法
  // value: 传入的原始值（这里是路由参数 :id 的值）
  // 返回: 转换后的值
  transform(value: string): number {
    // parseInt: 把字符串 "1" 转成数字 1
    // 第二个参数 10 表示十进制
    const id = parseInt(value, 10);

    // isNaN: 判断是不是 NaN（Not a Number）
    // 如果用户传了 "abc"，parseInt 返回 NaN，这个判断为 true
    // id <= 0: ID 必须大于 0
    if (isNaN(id) || id <= 0) {
      // BadRequestException: 抛出一个"错误请求"异常
      // NestJS 捕获这个异常后，返回 400 状态码 + 这里的消息
      throw new BadRequestException('ID 必须是一个正整数');
    }

    return id;
  }
}
