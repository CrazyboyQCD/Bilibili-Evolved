import { readdirSync, existsSync } from 'fs'
import { dirname, join, basename } from 'path'
import type { Plugin, TransformResult } from 'rolldown'

// 从原来的文件中复制这些值
import { commitHash } from './webpack/compilation-info/git'
import { runtimeInfo } from './webpack/compilation-info/runtime'

interface InjectMetadataContext {
  code: string
  filename: string
}

type InjectMetadataAction = (context: InjectMetadataContext) => string

const injectCoreInfo: InjectMetadataAction = ({ code }) => {
  const coreInfoProperties = `\n  commitHash: "${commitHash}",\n  coreVersion: "${runtimeInfo.version}",`
  // 寻找 component 或 plugin 对象的开始位置
  const componentMatch = code.match(/(const\s+component\s*=|const\s+plugin\s*=)\s*\{/)
  if (componentMatch) {
    const insertIndex = componentMatch.index! + componentMatch[0].length
    return (
      code.slice(0, insertIndex) +
      coreInfoProperties +
      code.slice(insertIndex)
    )
  }
  return code
}

const injectDescription: InjectMetadataAction = ({ code, filename }) => {
  const folder = dirname(filename)
  const defaultDesc = join(folder, 'index.md')
  
  if (!existsSync(defaultDesc)) {
    return code
  }

  const regex = /index\.(.+)\.md$/
  const descRegex = /index\.(.+)\.md$/
  const matchedFiles = readdirSync(folder).filter(file => 
    descRegex.test(file)
  )
  
  // 检查是否有对应的语言描述文件
  let descCode = ''
  if (matchedFiles.length > 0) {
    // 添加所有匹配的语言文件
    const langImports = matchedFiles.map(file => {
      const lang = file.match(descRegex)![1]
      return `    '${lang}': () => import('./${file}').then(m => m.default),`
    }).join('\n')
    
    descCode = `\n  description: (() => {\n    return {\n${langImports}\n    'zh-CN': () => import('./index.md').then(m => m.default),\n  }\n  })(),`
  } else {
    // 只有基础的index.md文件
    descCode = `\n  description: {\n    'zh-CN': () => import('./index.md').then(m => m.default),\n  },`
  }

  const componentMatch = code.match(/(const\s+component\s*=|const\s+plugin\s*=)\s*\{/)
  if (componentMatch) {
    const insertIndex = componentMatch.index! + componentMatch[0].length
    return (
      code.slice(0, insertIndex) +
      descCode +
      code.slice(insertIndex)
    )
  }
  return code
}

const injectI18n: InjectMetadataAction = ({ code, filename }) => {
  const folder = dirname(filename)
  const regex = /index\.(.+)\.ts$/
  const matchedFiles = readdirSync(folder).filter(file => file.match(regex))
  
  if (matchedFiles.length === 0) {
    return code
  }

  const langImports = matchedFiles.map(file => {
    const lang = file.match(regex)![1]
    return `    '${lang}': () => import('./${file}').then(m => m.default),`
  }).join('\n')

  const i18nCode = `\n  i18n: (() => {\n    return {\n${langImports}\n  }\n  })(),`

  const componentMatch = code.match(/(const\s+component\s*=|const\s+plugin\s*=)\s*\{/)
  if (componentMatch) {
    const insertIndex = componentMatch.index! + componentMatch[0].length
    return (
      code.slice(0, insertIndex) +
      i18nCode +
      code.slice(insertIndex)
    )
  }
  return code
}

export const injectMetadata = (): Plugin => {
  return {
    name: 'inject-metadata',
  
    transform: (code, id) => {
      // 检查是否是目标文件
      const isFromRegistry = id.startsWith(join(process.cwd(), 'registry'))
      const isFromCore = 
        id.startsWith(join(process.cwd(), 'src/components')) ||
        id.startsWith(join(process.cwd(), 'src/plugins'))
      const isEntryFile = basename(id) === 'index.ts'
      
      if (!((isFromRegistry || isFromCore) && isEntryFile)) {
        return null
      }

      // 检查是否包含 component 或 plugin 变量定义
      if (!code.includes('const component =') && !code.includes('const plugin =')) {
        return null
      }

      // 按顺序执行注入操作
      let result = code
      result = injectCoreInfo({ code: result, filename: id })
      result = injectDescription({ code: result, filename: id })
      result = injectI18n({ code: result, filename: id })

      if (result !== code) {
        return {
          code: result,
          map: null
        } as TransformResult
      }

      return null
    }
  }
}