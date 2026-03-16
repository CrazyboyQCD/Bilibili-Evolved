// import { getRandomId } from '../utils'
import { ComponentSettings, Settings, ValueChangeListener } from './types'
import { createProxy } from './proxy'
import { registeredListeners, settingsChangedHandler } from './listener'
import { initInternalSettings, settingsInternalState as state } from './internal-state'
import { readSettings } from './read'
import { ComponentMetadata, componentsMap, UnknownOptions } from '@/components/component'
import { PluginMetadata } from '@/plugins/plugin'
// import serialize from 'serialize-javascript'
import type { Options as SettingsPanelOptions } from '@/components/settings-panel'
import { matchUrlPattern } from '../utils'

initInternalSettings()
export { defaultSettings } from './internal-state'
state.internalSettings = createProxy(readSettings(state.internalSettings), settingsChangedHandler)
for (const [key, value] of Object.entries(state.internalSettings)) {
  GM_setValue(key, value)
}
// state.internalSettings.instance = getRandomId(32)

/**
 * 添加对设置里某项的监听
 * @param path 设置项的属性路径
 * @param listener 监听函数
 * @param initCall 添加监听后, 是否已当前设置值立即触发一次监听函数
 */
export const addSettingsChangeListener = <T = any>(
  path: string,
  listener: ValueChangeListener<T>,
  initCall = false,
) => {
  const handlers = registeredListeners.get(path)
  if (handlers) {
    handlers.push(listener)
  } else {
    registeredListeners.set(path, [listener])
  }
  if (initCall) {
    const value = lodash.get(state.internalSettings, path)
    listener(value, value, '', [])
  }
}
/**
 * 移除对设置项的某个监听函数
 * @param path 设置项的属性路径
 * @param listener 监听函数
 */
export const removeSettingsChangeListener = (path: string, listener: ValueChangeListener) => {
  const handlers = registeredListeners.get(path)
  if (!handlers) {
    return
  }
  const index = handlers.indexOf(listener)
  if (index === -1) {
    return
  }
  handlers.splice(index, 1)
}

state.settingsLoaded = true
/** 脚本当前的设置 */
export const settings: Settings = state.internalSettings

/**
 * 判断是否为自定义组件
 * @param component 组件定义
 */
export const isUserComponent = (component: ComponentMetadata | string) => {
  const name = typeof component === 'string' ? component : component.name
  return Boolean(settings.userComponents[name])
}

/**
 * 判断是否为自定义插件
 * @param plugin 插件定义
 */
export const isUserPlugin = (plugin: PluginMetadata | string) => {
  const name = typeof plugin === 'string' ? plugin : plugin.name
  return Boolean(settings.userPlugins[name])
}
const emptySettings: ComponentSettings = {
  enabled: false,
  options: new Proxy(
    {},
    {
      get() {
        return false
      },
    },
  ),
}

/**
 * 获取已加载组件的设置
 *
 * 使用此函数，应当确保该组件已被加载。
 * 否则返回值是一个默认的 ComponentSettings 对象：
 * ```js
 * {
 *   enabled: false,
 *   options: new Proxy({}, { get: () => false })
 * }
 * ```
 *
 * @param component 组件或组件名称
 */
export const getComponentSettings = <O extends UnknownOptions>(
  component: ComponentMetadata<O> | string,
): ComponentSettings<O> => {
  let componentMetadata: ComponentMetadata
  if (typeof component === 'string') {
    if (componentsMap[component] === undefined) {
      if (settings.components.settingsPanel.options.devMode) {
        console.warn('No settings found for component:', component)
      }
      return emptySettings as any
    }
    componentMetadata = componentsMap[component]
  } else {
    componentMetadata = component
  }
  if (isUserComponent(componentMetadata)) {
    const { name } = componentMetadata
    return (settings.userComponents[name]?.settings ?? emptySettings) as any
  }
  return settings.components[componentMetadata.name] as any
}

/**
 * 获取通用设置 (`settingsPanel`组件的`options`)
 */
export const getGeneralSettings = () =>
  getComponentSettings<SettingsPanelOptions>('settingsPanel').options
/**
 * 判断此组件是否启用, 启用的条件为:
 * - 若定义了排除列表, 当前URL必须不匹配其排除列表中任意一项(`Component.urlExclude`)
 * - 若定义了包含列表, 当前URL必须匹配其包含列表中的任意一项(`Component.urlInclude`)
 * - 组件自身必须已启用(`ComponentSettings.enabled`)
 * - 不可配置的组件(`Component.configurable === false`), 上一条判断将使用组件的默认值(`Component.enabledByDefault`)
 * @param component 组件或组件名称
 */
export const isComponentEnabled = (component: ComponentMetadata | string) => {
  if (typeof component === 'string') {
    component = componentsMap[component]
  }
  // 不存在 / 未安装的组件
  if (!component) {
    return false
  }
  // 若指定了排除URL, 任意URL匹配就不加载
  if (component.urlExclude && component.urlExclude.some(matchUrlPattern)) {
    return false
  }
  // 若指定了包含URL, 所有URL都不匹配时不加载
  if (component.urlInclude && component.urlInclude.every(lodash.negate(matchUrlPattern))) {
    return false
  }
  // 不可更改的组件永远返回默认值
  if (component.configurable === false) {
    return component.enabledByDefault ?? true
  }
  return getComponentSettings(component).enabled
}

const componentPath = (path: string) => {
  const [name, ...optionPath] = path.split('.')
  const optionName = optionPath.join('.')
  if (!isUserComponent(name)) {
    if (!optionName) {
      return `components.${name}.enabled`
    }
    return `components.${name}.options.${optionName}`
  }
  // user components
  if (!optionName) {
    return `userComponents.${name}.settings.enabled`
  }
  return `userComponents.${name}.settings.options.${optionName}`
}
/**
 * 添加对组件设置的监听
 * @param path 组件名称, 或后面跟上`.`代表组件选项; 例如`darkMode`或`defaultPlayerMode.autoLightOff`
 * @param listener 监听函数
 * @param initCall 添加监听后, 是否已当前设置值立即触发一次监听函数
 */
export const addComponentListener = <T = any>(
  path: string,
  listener: ValueChangeListener<T>,
  initCall = false,
) => {
  addSettingsChangeListener(componentPath(path), listener, initCall)
}
/**
 * 移除对组件设置的监听
 * @param path 组件设置路径
 * @param listener 监听函数
 */
export const removeComponentListener = (path: string, listener: ValueChangeListener) => {
  removeSettingsChangeListener(componentPath(path), listener)
}

export * from './helpers'
export * from './types'
