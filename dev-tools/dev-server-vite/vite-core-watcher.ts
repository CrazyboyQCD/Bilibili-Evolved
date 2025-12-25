import exitHook from 'async-exit-hook'
import { build, type InlineConfig } from 'vite'
import { resolve } from 'path'
import { sendMessage } from './web-socket-server'
import { userScriptPlugin } from '../../vite-plugin-userscript'

export const startCoreWatcher = async () => {
  // 创建Vite配置用于构建核心脚本
  const viteConfig: InlineConfig = {
    plugins: [
      userScriptPlugin({
        meta: {
          name: 'Bilibili Evolved',
          description: '强大的哔哩哔哩增强脚本',
          version: '[gitHash]',
          author: 'Grant Howard, Coulomb-G',
          license: 'MIT'
        }
      })
    ],
    build: {
      watch: {}, // 启用监听模式
      lib: {
        entry: resolve(__dirname, '../../src/client/bilibili-evolved.ts'),
        name: 'BilibiliEvolved',
        formats: ['iife'],
      },
      outDir: './dist',
      rolldownOptions: {
        output: {
          // 输出单个JS文件
          entryFileNames: 'bilibili-evolved.dev.user.js',
        },
      },
    },
    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    },
  }

  // 使用Vite构建系统进行监听构建
  const builder = await build(viteConfig)
  
  // 监听构建完成事件
  if (builder && typeof builder === 'object' && 'close' in builder) {
    // 如果是watch模式，可以监听close事件
    const watcher = builder
    watcher.on('event', (event) => {
      if (event.code === 'BUNDLE_END') {
        console.log('本体已编译:', event.output)
        sendMessage({
          type: 'coreUpdate',
        })
      }
    })
  }

  exitHook(exit => {
    if (builder && typeof builder === 'object' && 'close' in builder) {
      builder.close().then(() => {
        console.log('本体编译器已退出')
        exit()
      })
    }
  })
}