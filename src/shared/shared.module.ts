/**
 * ─────────────────────────────────────────────
 *  shared.module.ts — 共享模块
 * ─────────────────────────────────────────────
 *
 * 这个模块的作用：
 * 把需要被多个业务模块共享的 Service、DTO、工具类放在这里，
 * 避免各个模块之间互相直接引用造成"你中有我我中有你"的循环依赖。
 *
 * 当前是空的，因为 shared/ 下的 DTO 和接口只是"纯类"和"纯类型"，
 * 不需要经过 NestJS 的 DI 容器管理，直接 import 就能用。
 *
 * 将来如果出现以下需求，就可以用这个模块：
 *   - 邮件发送服务（MailService）—— 需要被多个模块注入
 *   - 文件上传工具（UploadService）
 *   - 通用工具函数
 *
 * exports: [] 现在是空的，因为目前没有需要导出的 Provider。
 * 哪天你想共享一个 Service，就在 providers 里注册然后在 exports 里导出。
 */

import { Module } from '@nestjs/common';

@Module({
  exports: [], // 数组，目前为空，后续可添加需要共享的 Service
})
export class SharedModule {}
