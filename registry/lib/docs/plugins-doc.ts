import { getDescriptionMarkdown } from '@/components/description'
import { PluginMetadata } from '@/plugins/plugin'
import { DocSource, DocSourceItem } from './types'
import { getId } from '../id'
import { getThirdPartyDescription, thirdPartyPlugins } from './third-party'

export const getPluginsDoc: DocSource = async rootPath => {
  const pluginsContext = import.meta.glob<PluginMetadata>('../plugins/**/index.ts', {
    eager: true,
    import: 'plugin',
  })
  const pluginsPaths = Object.entries(pluginsContext)
    .map(async ([path, plugin]) => {
      const root = `${rootPath}plugins/`
      const fullRelativePath = `${root}${getId(root, path.replace(/^\.?\//, ''))}.js`
      const fullAbsolutePath = fullRelativePath.replace(/^(\.\.?\/)*/, '')
      const { name, displayName } = plugin
      const description = await getDescriptionMarkdown(plugin)
      return {
        type: 'plugin',
        name,
        displayName,
        description,
        fullRelativePath,
        fullAbsolutePath,
      } as DocSourceItem
    })
    .concat(thirdPartyPlugins.map(getThirdPartyDescription))
  return {
    title: '插件',
    items: await Promise.all(pluginsPaths),
  }
}
