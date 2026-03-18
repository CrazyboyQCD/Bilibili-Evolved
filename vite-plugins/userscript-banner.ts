import { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

/**
 * Vite 插件：为 Userscript 添加元数据头部
 * 模仿 Webpack BannerPlugin 的行为
 */
export function userscriptBannerPlugin(): Plugin {
    let config: any

    return {
        name: 'userscript-banner',

        configResolved(resolvedConfig) {
            config = resolvedConfig
        },

        async closeBundle() {
            const outputPath = path.resolve(config.root, config.build.outDir)
            const jsFilePath = path.resolve(outputPath, 'bilibili-evolved.iife.js')
            const cssFilePath = path.resolve(outputPath, 'bilibili-evolved.css')
            const userJsPath = path.resolve(outputPath, 'bilibili-evolved.user.js')

            if (fs.existsSync(jsFilePath)) {
                // 读取生成的 JS 文件
                let jsContent = fs.readFileSync(jsFilePath, 'utf-8')

                // 如果存在 CSS 文件，将其内联到 JS 中
                if (fs.existsSync(cssFilePath)) {
                    const cssContent = fs.readFileSync(cssFilePath, 'utf-8')
                    // 将 CSS 作为样式标签插入到 JS 开头
                    const styleTag = `\n(function() {
  const style = document.createElement('style');
  style.textContent = ${JSON.stringify(cssContent)};
  document.head.appendChild(style);
})();\n`
                    jsContent = styleTag + jsContent
                }

                // 读取 meta 数据
                const commonMetaPath = path.resolve(config.root, 'src/client/common.meta.json')
                const mainMetaPath = path.resolve(config.root, 'src/client/bilibili-evolved.meta.json')

                let commonMeta = {}
                let mainMeta = {}

                if (fs.existsSync(commonMetaPath)) {
                    commonMeta = JSON.parse(fs.readFileSync(commonMetaPath, 'utf-8'))
                }

                if (fs.existsSync(mainMetaPath)) {
                    mainMeta = JSON.parse(fs.readFileSync(mainMetaPath, 'utf-8'))
                }

                // 合并元数据
                const meta = { ...commonMeta, ...mainMeta }

                // 生成 banner
                const banner = `// ==UserScript==
${Object.entries(meta)
                        .map(([key, value]) => {
                            if (Array.isArray(value)) {
                                return value.map(item => `// @${key.padEnd(16, ' ')}${item}`).join('\n')
                            }
                            return `// @${key.padEnd(16, ' ')}${value}`
                        })
                        .join('\n')}
// ==/UserScript==
/* eslint-disable */ /* spell-checker: disable */
// @[ You can find all source codes in GitHub repo ]

`

                // 写入最终的 userscript 文件
                fs.writeFileSync(userJsPath, banner + jsContent)

                console.log('✅ Userscript 文件已生成:', userJsPath)
            }
        }
    }
}