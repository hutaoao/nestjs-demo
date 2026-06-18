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
import type { User } from '../../api/users'
import { usersApi } from '../../api/users'
import useAuthStore from '../../stores/authStore'

const { Title } = Typography

export default function UsersPage() {
  const currentUser = useAuthStore((s) => s.user)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await usersApi.findAll()
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreate = () => {
    setEditingUser(null)
    form.resetFields()
    setOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    form.setFieldsValue(user)
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await usersApi.remove(id)
      message.success('删除成功')
      fetchUsers()
    } catch (err: unknown) {
      message.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || '删除失败')
    }
  }

  const handleOk = async () => {
    const values = await form.validateFields()
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, values)
        message.success('更新成功')
      } else {
        await usersApi.create(values)
        message.success('创建成功')
      }
      setOpen(false)
      fetchUsers()
    } catch (err: unknown) {
      message.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || '操作失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '用户'}
        </Tag>
      ),
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
      render: (_: unknown, record: User) =>
        currentUser?.role === 'admin' ? (
          <Space>
            <Button type="link" onClick={() => handleEdit(record)}>
              编辑
            </Button>
            {currentUser?.id !== record.id && (
              <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
                <Button type="link" danger>
                  删除
                </Button>
              </Popconfirm>
            )}
          </Space>
        ) : (
          <Tag color="default">只读</Tag>
        ),
    },
  ]

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          用户管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建用户
        </Button>
      </div>
      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="密码" rules={[{ required: true, min: 6 }]}>
              <Input.Password />
            </Form.Item>
          )}
          {currentUser?.role === 'admin' && (
            <Form.Item name="role" label="角色">
              <Select
                options={[
                  { value: 'user', label: '用户' },
                  { value: 'admin', label: '管理员' },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  )
}
