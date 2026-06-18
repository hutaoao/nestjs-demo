import api from './index'

export interface UploadResponse {
  url: string
  filename: string
}

export const filesApi = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post<UploadResponse>('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}
