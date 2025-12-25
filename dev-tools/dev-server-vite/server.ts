import { createServer, type ViteDevServer } from 'vite'
import { resolve } from 'path'
import { buildByEntry } from '../../registry/webpack/config'
import { devServerConfig } from './config'
import { parseRegistryUrl, startRegistryWatcher, watchers } from './registry-watcher'
import { exitWebSocketServer } from './web-socket-server'
import exitHook from 'async-exit-hook'
import type { Configuration } from 'webpack'

export const startDevServer = async (): Promise<ViteDevServer> => {
  const { port } = devServerConfig

  // 创建 Vite 开发服务器配置
  const viteDevServer = await createServer({
    server: {
      port,
      middlewareMode: true, // 启用中间件模式
      hmr: false, // 禁用 Vite 自带的 HMR，使用自定义 WebSocket
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, '../../src'),
      }
    },
    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    },
  })

  // 添加自定义中间件处理请求
  viteDevServer.middlewares.use((req, res, next) => {
    const { url } = req
    console.log('请求:', url)
    
    if (url?.startsWith('/registry')) {
      const existingWatcher = watchers.find(w => w.url === url)
      const registryInfo = parseRegistryUrl(url)
      if (existingWatcher && registryInfo) {
        console.log(`已复用功能编译器: ${url}`)
      }
      if (existingWatcher || !registryInfo) {
        next()
      } else {
        startRegistryWatcher(
          url,
          buildByEntry({
            ...registryInfo,
            mode: 'development',
          }) as Configuration,
        ).then(() => next())
      }
    } else {
      next()
    }
  })

  // 设置退出钩子
  exitHook(exit => {
    exitWebSocketServer()
    viteDevServer.close().then(() => {
      console.log('Vite DevServer 已退出')
      exit()
    }).catch(error => {
      console.error(error)
      exit()
    })
  })

  // 启动服务器
  await viteDevServer.listen()

  console.log(`Vite DevServer 已启动, 端口: ${port}`)
  
  return viteDevServer
}