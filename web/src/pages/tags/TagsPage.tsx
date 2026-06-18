import { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Tag,
  Typography,
  message,
  Popconfirm,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { Tag as TagType } from '../../api/tags'
import { tagsApi } from '../../api/tags'
import useAuthStore from '../../stores/authStore'

const { Title } = Typography

export default function TagsPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const fetchTags = async () => {
    setLoading(true)
    try {
      const data = await tagsApi.findAll()
      setTags(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const handleCreate = async () => {
    const values = await form.validateFields()
    try {
      await tagsApi.create(values)
      message.success('创建成功')
      setOpen(false)
      form.resetFields()
      fetchTags()
    } catch (err: unknown) {
      message.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || '创建失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await tagsApi.remove(id)
      message.success('删除成功')
      fetchTags()
    } catch (err: unknown) {
      message.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || '删除失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '标签名', dataIndex: 'name', key: 'name' },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: TagType) =>
        isAdmin ? (
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        ) : (
          <Tag color="default">无权限</Tag>
        ),
    },
  ]

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          标签管理
        </Title>
        {isAdmin && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
          >
            新建标签
          </Button>
        )}
      </div>
      <Table
        dataSource={tags}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title="新建标签"
        open={open}
        onOk={handleCreate}
        onCancel={() => {
          setOpen(false)
          form.resetFields()
        }}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="标签名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
