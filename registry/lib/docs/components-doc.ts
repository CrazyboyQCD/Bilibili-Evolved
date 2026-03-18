import { ComponentMetadata } from '@/components/types'
import { DocSource, DocSourceItem } from './types'
import { getId } from '../id'
import { getThirdPartyDescription, thirdPartyComponents } from './third-party'

export const getComponentsDoc: DocSource = async rootPath => {
  const { getDescriptionMarkdown } = await import('@/components/description')
  const componentsContext = import.meta.glob<{ component?: ComponentMetadata }>(
    '../components/**/index.ts',
    { eager: true, import: 'default' },
  )
  const componentsPaths = Object.entries(componentsContext)
    // 检查模块中是否存在 component 属性（命名导出）
    .filter(module => 'component' in module)
    .map(async ([path, { component }]) => {
      const root = `${rootPath}components/`
      const fullRelativePath = `${root}${getId(root, path.replace(/^\.?\//, ''))}.js`
      const fullAbsolutePath = fullRelativePath.replace(/^(\.\.?\/)*/, '')
      const { name, displayName } = component
      const description = await getDescriptionMarkdown(component)
      return {
        type: 'component',
        name,
        displayName,
        description,
        fullRelativePath,
        fullAbsolutePath,
      } as DocSourceItem
    })
    .concat(thirdPartyComponents.map(getThirdPartyDescription))
  return {
    title: '组件',
    items: await Promise.all(componentsPaths),
  }
}
