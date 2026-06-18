import api from './index'

export interface DynamicConfig {
  configPath: string
  message: string
}

export const dynamicConfigApi = {
  get: () =>
    api.get<DynamicConfig>('/dynamic-config').then((r) => r.data),
}
