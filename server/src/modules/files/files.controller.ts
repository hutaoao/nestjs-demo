/**
 * ─────────────────────────────────────────────
 *  files.controller.ts — 文件上传控制器
 * ─────────────────────────────────────────────
 *
 * 演示 NestJS 的文件上传功能。
 * 使用内置的 FileInterceptor + @UploadedFile()，仅需两个装饰器。
 *
 * 前端类比：
 *   // React/Axios 上传文件
 *   const formData = new FormData()
 *   formData.append('file', selectedFile)
 *   axios.post('/files/upload', formData, {
 *     headers: { 'Content-Type': 'multipart/form-data' }
 *   })
 *
 * 这里 form-data 的字段名 'file' 必须和 FileInterceptor('file') 一致。
 *
 * 常见问题：
 *   Q: FileInterceptor('file') 是啥？
 *   A: NestJS 对 Multer 的封装。'file' 是 form-data 中文件字段名。
 *      Multer 会解析 multipart/form-data 格式的请求体，
 *      找到字段名为 'file' 的文件，提取出来。
 *
 *   Q: @UploadedFile() 拿到的是什么？
 *   A: Express.Multer.File 对象，包含：
 *      - originalname: 原始文件名
 *      - mimetype: 文件类型（如 image/png, text/plain）
 *      - size: 文件大小（字节）
 *      - buffer: 文件内容（二进制）
 *      - fieldname: 表单字段名（本例是 'file'）
 *
 *   Q: 文件存在哪了？
 *   A: 默认存在内存里（buffer），适合小文件。
 *      大文件可以用 disk storage engine 存磁盘。
 */

import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  // ── POST /files/upload 上传文件 ──
  @Post('upload')
  // @UseInterceptors(FileInterceptor('file')):
  //   使用 FileInterceptor 拦截器，它会自动解析 multipart/form-data
  //   参数 'file' 是 form-data 中的字段名，必须和前端保持一致
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传文件（multipart/form-data）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: '要上传的文件' },
      },
    },
  })
  uploadFile(
    // @UploadedFile() 提取上传的文件对象
    // Express.Multer.File 是 Multer 的类型定义
    // file! 的 ! 告诉 TS"这个值一定存在"
    @UploadedFile() file: Express.Multer.File,
  ) {
    return {
      originalname: file.originalname,  // 原始文件名
      mimetype: file.mimetype,          // MIME 类型
      size: file.size,                  // 文件大小（字节）
      message: '文件上传成功',
    };
  }
}
