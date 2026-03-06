import { OptionsOfMetadata, defineOptionsMetadata } from '@/components/define'
import { getNumberValidator } from '@/core/utils'

export const options = defineOptionsMetadata({
  longJumpSeconds: {
    defaultValue: 85,
    displayName: '长跳跃秒数',
    validator: getNumberValidator(1),
  },
  volumeStep: {
    defaultValue: 10,
    displayName: '音量调整幅度',
    validator: getNumberValidator(1, 100),
  },
  customKeyBindings: {
    defaultValue: {} as Record<string, string>,
    displayName: '自定义键位',
    hidden: true,
  },
  preset: {
    defaultValue: 'Default',
    displayName: '预设',
    hidden: true,
  },
})

export type Options = OptionsOfMetadata<typeof options>
