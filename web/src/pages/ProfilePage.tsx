import { Card, Descriptions, Tag, Typography } from 'antd'
import useAuthStore from '../stores/authStore'

const { Title } = Typography

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  return (
    <Card>
      <Title level={4}>个人中心</Title>
      <Descriptions column={1} bordered style={{ marginTop: 16 }}>
        <Descriptions.Item label="用户 ID">{user.id}</Descriptions.Item>
        <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{user.email}</Descriptions.Item>
        <Descriptions.Item label="角色">
          <Tag color={user.role === 'admin' ? 'red' : 'blue'}>
            {user.role === 'admin' ? '管理员' : '普通用户'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {user.createdAt ? new Date(user.createdAt).toLocaleString('zh-CN') : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="更新时间">
          {user.updatedAt ? new Date(user.updatedAt).toLocaleString('zh-CN') : '-'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  )
}
