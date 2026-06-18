import { useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Layout,
  Menu,
  Button,
  Dropdown,
  Spin,
  theme,
  Avatar,
} from 'antd'
import {
  UserOutlined,
  FileTextOutlined,
  TagsOutlined,
  UploadOutlined,
  SettingOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from '@ant-design/icons'
import useAuthStore from '../stores/authStore'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/users', icon: <UserOutlined />, label: '用户管理' },
  { key: '/posts', icon: <FileTextOutlined />, label: '文章管理' },
  { key: '/tags', icon: <TagsOutlined />, label: '标签管理' },
  { key: '/files', icon: <UploadOutlined />, label: '文件上传' },
  { key: '/dynamic-config', icon: <SettingOutlined />, label: '配置信息' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token: themeToken } = theme.useToken()
  const { user, logout, fetchProfile, token } = useAuthStore()
  const fetched = useRef(false)

  useEffect(() => {
    if (token && !fetched.current) {
      fetched.current = true
      fetchProfile()
    }
  }, [token, fetchProfile])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems = {
    items: [
      {
        key: 'profile',
        icon: <ProfileOutlined />,
        label: '个人中心',
        onClick: () => navigate('/profile'),
      },
      { type: 'divider' as const },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        style={{
          background: themeToken.colorBgContainer,
          borderRight: `1px solid ${themeToken.colorBorderSecondary}`,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: 18,
            color: themeToken.colorPrimary,
            borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
          }}
        >
          NestJS Demo
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderInlineEnd: 'none' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: themeToken.colorBgContainer,
            borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '0 24px',
            height: 64,
          }}
        >
          <Dropdown menu={userMenuItems} placement="bottomRight">
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} size="small" />
              {user.username}
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
