import { useEffect, useState } from 'react'
import { Card, Descriptions, Tag, Typography, Spin } from 'antd'
import { dynamicConfigApi, type DynamicConfig } from '../../api/dynamic-config'

const { Title } = Typography

export default function DynamicConfigPage() {
  const [config, setConfig] = useState<DynamicConfig | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    dynamicConfigApi
      .get()
      .then(setConfig)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />
  if (!config) return null

  return (
    <Card>
      <Title level={4}>动态配置信息</Title>
      <p style={{ color: '#888', marginBottom: 16 }}>
        本页面演示 NestJS 动态模块（DynamicModule）特性，
        配置路径由 DynamicConfigModule.forRoot() 在启动时动态传入。
      </p>
      <Descriptions column={1} bordered>
        <Descriptions.Item label="配置路径">
          <Tag color="blue">{config.configPath}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="说明">
          {config.message}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  )
}
