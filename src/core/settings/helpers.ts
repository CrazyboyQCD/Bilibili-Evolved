import { UnknownOptions, OptionsMetadata, ComponentMetadata } from '@/components/component'
import { ComponentSettings } from './types'

/**
 * 生成组件选项设置
 * @param options 组件选项定义
 */
export const metadataToOptions = <O extends UnknownOptions>(options: OptionsMetadata<O>): O =>
  lodash.mapValues(options, m => m.defaultValue) as O

/**
 * 生成组件设置
 * @param component 组件定义
 */
export const componentToSettings = <O extends UnknownOptions>(
  component: ComponentMetadata<O>,
): ComponentSettings<O> => {
  const { options: meta } = component
  return {
    enabled: component.enabledByDefault ?? true,
    options: (meta ? metadataToOptions(meta as any) : {}) as any,
  }
}
