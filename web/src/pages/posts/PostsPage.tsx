import { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Typography,
  message,
  Popconfirm,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { Post, PaginatedResponse } from '../../api/posts'
import { postsApi } from '../../api/posts'
import type { Tag as TagType } from '../../api/tags'
import { tagsApi } from '../../api/tags'
import useAuthStore from '../../stores/authStore'

const { Title } = Typography
const { TextArea } = Input

export default function PostsPage() {
  const currentUser = useAuthStore((s) => s.user)
  const isAdmin = currentUser?.role === 'admin'
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [form] = Form.useForm()

  const fetchPosts = async (p = page, ps = pageSize) => {
    setLoading(true)
    try {
      const res: PaginatedResponse<Post> = await postsApi.findAll({ page: p, limit: ps })
      const filtered = isAdmin
        ? res.data
        : res.data.filter((post) => post.authorId === currentUser?.id)
      setPosts(filtered)
      setTotal(isAdmin ? res.total : filtered.length)
      setPage(res.page)
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const data = await tagsApi.findAll()
      setTags(data)
    } catch {
      // tags might be empty
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchPosts()
      fetchTags()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])

  const handleCreate = () => {
    setEditingPost(null)
    form.resetFields()
    setOpen(true)
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setOpen(true)
    // setFieldsValue 在 Modal.afterOpenChange 中执行
  }

  const handleDelete = async (id: number) => {
    try {
      await postsApi.remove(id)
      message.success('删除成功')
      fetchPosts()
    } catch (err: unknown) {
      message.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || '删除失败')
    }
  }

  const handleOk = async () => {
    const values = await form.validateFields()
    try {
      if (editingPost) {
        await postsApi.update(editingPost.id, values)
        message.success('更新成功')
      } else {
        await postsApi.create({ ...values, authorId: currentUser!.id })
        message.success('创建成功')
      }
      setOpen(false)
      fetchPosts()
    } catch (err: unknown) {
      message.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || '操作失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: '作者',
      key: 'author',
      render: (_: unknown, record: Post) => record.author?.username ?? '-',
    },
    {
      title: '标签',
      key: 'tags',
      render: (_: unknown, record: Post) =>
        record.tags?.length
          ? record.tags.map((t) => (
              <Tag key={t.id} color="blue">
                {t.name}
              </Tag>
            ))
          : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Post) => {
        const canManage = isAdmin || record.authorId === currentUser?.id
        return canManage ? (
          <Space>
            <Button type="link" onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ) : (
          <Tag color="default">无权限</Tag>
        )
      },
    },
  ]

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          文章管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建文章
        </Button>
      </div>
      <Table
        dataSource={posts}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
            fetchPosts(p, ps)
          },
        }}
      />
      <Modal
        title={editingPost ? '编辑文章' : '新建文章'}
        open={open}
        onOk={handleOk}
        onCancel={() => { setOpen(false); setEditingPost(null) }}
        destroyOnHidden
        width={640}
        afterOpenChange={(visible) => {
          if (visible && editingPost) {
            form.setFieldsValue({
              ...editingPost,
              tagIds: editingPost.tags?.map((t) => t.id) ?? [],
            })
          }
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <TextArea rows={6} />
          </Form.Item>
          <Form.Item name="tagIds" label="标签">
            <Select
              mode="multiple"
              placeholder="选择标签（可选）"
              allowClear
              options={tags.map((tag) => ({
                value: tag.id,
                label: tag.name,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
