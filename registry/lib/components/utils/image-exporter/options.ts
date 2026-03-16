import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'

export const options = defineOptionsMetadata({
  columnFormat: {
    defaultValue: '[title][ - n]',
    displayName: '专栏图片命名格式',
    multiline: true,
  },
  feedFormat: {
    defaultValue: '[user][ - id][ - n]',
    displayName: '动态图片命名格式',
    multiline: true,
  },
})

export type ImageExporterOptions = OptionsOfMetadata<typeof options>
