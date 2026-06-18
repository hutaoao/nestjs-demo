import api from './index'

export interface Post {
  id: number
  title: string
  content: string
  authorId: number
  author?: { id: number; username: string }
  // tags 在前端层面统一为扁平格式 { id, name }[]
  tags?: { id: number; name: string }[]
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface CreatePostDto {
  title: string
  content: string
  authorId: number
  tagIds?: number[]
}

export interface UpdatePostDto {
  title?: string
  content?: string
  tagIds?: number[]
}

/** 将后端 Prisma PostTag 嵌套格式转为前端扁平格式 */
function flattenTags(post: Record<string, unknown>): Post {
  const rawTags = post.tags as Array<{ tag: { id: number; name: string } }> | undefined
  return {
    ...post as unknown as Post,
    tags: rawTags?.map((t) => ({ id: t.tag.id, name: t.tag.name })),
  }
}

export const postsApi = {
  findAll: (params?: { page?: number; limit?: number }) =>
    api
      .get<PaginatedResponse<Record<string, unknown>>>('/posts', { params })
      .then((r) => ({
        ...r.data,
        data: r.data.data.map(flattenTags),
      })),

  findOne: (id: number) =>
    api
      .get<Record<string, unknown>>(`/posts/${id}`)
      .then((r) => flattenTags(r.data)),

  create: (data: CreatePostDto) =>
    api
      .post<Record<string, unknown>>('/posts', data)
      .then((r) => flattenTags(r.data)),

  update: (id: number, data: UpdatePostDto) =>
    api
      .patch<Record<string, unknown>>(`/posts/${id}`, data)
      .then((r) => flattenTags(r.data)),

  remove: (id: number) =>
    api.delete<void>(`/posts/${id}`).then((r) => r.data),
}
