import { existsSync, readdirSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { objectProperty, identifier, stringLiteral } from '@babel/types'
import { InjectMetadataAction } from './types'

/**
 * 当入口文件 index.ts 旁边还有 index.md 时, 将其作为中文的 description 注入.
 * 如果还有 index.{language}.md, 也会一并作为多语言的 description 注入.
 * 注意 index.ts 中原有的 description 会被覆盖.
 *
 * 例子:
 * - index.ts
 * - index.md
 * - index.en-US.md
 *
 * 可以自动在 index.ts 中的定义中注入 zh-CN 和 en-US 的 description
 */
export const injectDescription: InjectMetadataAction = ({ filename }) => {
  const folder = dirname(filename)
  const defaultDesc = join(folder, 'index.md')
  if (!existsSync(defaultDesc)) {
    return []
  }
  // 直接读取默认描述文件
  const defaultContent = readFileSync(defaultDesc, 'utf-8')

  // 查找所有语言版本的描述文件
  const languageFiles = []
  const files = readdirSync(folder)
  const regex = /^index\.(.+)\.md$/

  files.forEach(file => {
    const match = file.match(regex)
    if (match) {
      const lang = match[1]
      const content = readFileSync(join(folder, file), 'utf-8')
      languageFiles.push({ lang, content })
    }
  })

  // 构建描述对象
  const descriptionObj = {
    'zh-CN': defaultContent,
    ...Object.fromEntries(languageFiles.map(({ lang, content }) => [lang, content])),
  }

  return [objectProperty(identifier('description'), stringLiteral(JSON.stringify(descriptionObj)))]
}
