import { defineConfig } from 'orval';

export default defineConfig({
  testApi: {
    output: {
      mode: 'tags-split',
      target: './src/api/endpoint/index.ts',
      schemas: './src/api/model',
      clean: true, // 每次生成前清理目录
      mock: false,
      prettier: true,
      client: 'axios',
      override: {
        // 自定义配置
        mutator: {
          path: './src/utils/request.ts', // 自定义axios实例
          name: 'request', // 导出的实例名称
          default: true
        }
      }
    },
    input: {
      target: 'xxxxxxxxx'
    }
  }
});
