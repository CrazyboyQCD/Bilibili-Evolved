import { Plugin } from 'vite'
import fs from 'fs'
import { execSync } from 'child_process'
import path from 'path'

interface UserScriptOptions {
  meta?: Record<string, string | string[]>
  externalLibraries?: string[]
}

// 获取 Git 信息
const getGitInfo = () => {
  try {
    return {
      commitHash: execSync('git rev-parse --short HEAD').toString().trim(),
      branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
      nearestTag: execSync('git describe --abbrev=0 --tags --always').toString().trim(),
      versionWithTag: execSync('git describe --tags --always').toString().trim(),
    }
  } catch (e) {
    console.warn(`无法获取 Git 信息: ${(e as Error).message}`)
    return {
      commitHash: 'unknown',
      branch: 'unknown',
      nearestTag: 'unknown',
      versionWithTag: 'unknown',
    }
  }
}

// 获取运行时信息
const getRuntimeInfo = () => {
  const commonMetaPath = path.resolve(__dirname, 'src/client/common.meta.json')
  const commonMeta = JSON.parse(fs.readFileSync(commonMetaPath, 'utf-8'))

  // 定义CDN配置
  const github = {
    name: 'GitHub',
    domain: 'raw.githubusercontent.com',
    repo: {
      owner: 'the1812',
      name: 'Bilibili-Evolved',
    },
    get link() {
      return `https://${this.domain}/${this.repo.owner}/${this.repo.name}`
    },
  }

  const jsDelivr = {
    name: 'jsDelivr',
    link: 'https://cdn.jsdelivr.net/gh/the1812/Bilibili-Evolved',
  }

  const altCdn = github
  const allCdns = { github, jsDelivr }

  return {
    year: new Date().getFullYear(),
    version: commonMeta.version,
    altCdn,
    allCdns,
  }
}

export const userScriptPlugin = (options: UserScriptOptions): Plugin => {
  const gitInfo = getGitInfo()
  const runtimeInfo = getRuntimeInfo()
  const compilationInfo = { ...runtimeInfo, ...gitInfo }

  return {
    name: 'userscript',
    enforce: 'pre', // 确保此插件优先执行
    transform(code) {
      let transformedCode = code

      // 替换 webpackCompilationInfo 引用为实际值
      transformedCode = transformedCode.replace(/\bwebpackCompilationInfo\b/g, JSON.stringify(compilationInfo))

      // 替换 webpackGitInfo 引用
      transformedCode = transformedCode.replace(/\bwebpackGitInfo\b/g, JSON.stringify(gitInfo))

      return {
        code: transformedCode,
        map: null
      }
    },
    generateBundle(_, bundle) {
      // 为所有入口文件添加 UserScript 头部
      for (const [fileName, bundleItem] of Object.entries(bundle)) {
        if (bundleItem.type === 'chunk' && bundleItem.isEntry) {
          const commonMeta = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'src/client/common.meta.json'), 'utf-8'))
          const fullMeta = { ...options.meta, ...commonMeta }

          let banner = `// ==UserScript==\n`
          for (const [key, value] of Object.entries(fullMeta)) {
            if (Array.isArray(value)) {
              const lines = [
                ...new Set(value.map(item => `// @${key.padEnd(16, ' ')}${item}`)),
              ]
              banner += lines.join('\n') + '\n'
            } else {
              banner += `// @${key.padEnd(16, ' ')}${value}\n`
            }
          }
          banner += `// ==/UserScript==\n/* eslint-disable */ /* spell-checker: disable */\n// @[ You can find all source codes in GitHub repo ]\n`

          // 添加到代码开头
          if (bundleItem.type === 'chunk') {
            bundleItem.code = banner + bundleItem.code
          }
        }
      }
    }
  }
}