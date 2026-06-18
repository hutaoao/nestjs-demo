/**
 * ─────────────────────────────────────────────
 *  api-response.interface.ts — 统一 API 响应接口
 * ─────────────────────────────────────────────
 *
 * 前端类比：TypeScript 类型定义文件（.d.ts）。
 *
 * 只是类型定义，没有实际代码逻辑。
 * 用来约定后端返回的数据格式，方便前端对接。
 *
 * 配合 http-exception.filter.ts，所有错误响应自动符合这个格式：
 *   { code: 404, message: "用户 #999 不存在", timestamp: "...", path: "/users/999" }
 *
 * 不过当前业务接口（GET /users）返回的是 Prisma 原始数据，
 * 还没有强制使用这个接口。后续如果要统一，可以在 Interceptor 里包装。
 */

// T = unknown 是泛型默认值，使用时可以指定具体类型
// 比如 ApiResponse<{ id: number; name: string }>
export interface ApiResponse<T = unknown> {
  /** HTTP 状态码 */
  code: number;
  /** 提示消息 */
  message: string;
  /** 实际数据（可选，错误响应时可能没有） */
  data?: T;
  /** 响应时间戳 */
  timestamp: string;
  /** 请求路径 */
  path: string;
}

/**
 * 分页响应的接口
 */
export interface PaginatedResponse<T> {
  /** 当前页的数据列表 */
  items: T[];
  /** 总记录数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  limit: number;
  /** 总页数 */
  totalPages: number;
}
