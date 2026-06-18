import { useState } from 'react'
import { Card, Upload, Button, Typography, message, Image } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd'
import { filesApi } from '../../api/files'

const { Title } = Typography

export default function FilesPage() {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const handleUpload = async (file: File) => {
    try {
      const res = await filesApi.upload(file)
      message.success('上传成功')
      setUploadedUrl(res.url)
      return false // prevent default upload
    } catch (err: unknown) {
      message.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || '上传失败')
      return false
    }
  }

  return (
    <Card>
      <Title level={4}>文件上传</Title>
      <Upload
        fileList={fileList}
        onChange={({ fileList: newList }) => setFileList(newList)}
        beforeUpload={handleUpload}
        maxCount={1}
      >
        <Button icon={<UploadOutlined />}>选择文件并上传</Button>
      </Upload>
      {uploadedUrl && (
        <div style={{ marginTop: 24 }}>
          <Title level={5}>上传结果</Title>
          <p>URL: {uploadedUrl}</p>
          {uploadedUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
            <Image width={300} src={uploadedUrl} alt="uploaded" />
          )}
        </div>
      )}
    </Card>
  )
}
