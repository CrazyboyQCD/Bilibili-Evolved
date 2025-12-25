import { startCoreWatcher } from './vite-core-watcher'
import { startViteDevServer } from './vite-server'
import { startWebSocketServer } from './web-socket-server'

startViteDevServer().then(server => {
  // 获取 Node.js 原生 HTTP 服务器实例
  const httpServer = server.httpServer
  startCoreWatcher()
  startWebSocketServer(httpServer)
})