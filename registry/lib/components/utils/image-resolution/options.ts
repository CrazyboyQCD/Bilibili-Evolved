import { defineOptionsMetadata, OptionsOfMetadata } from '@/components/define'

export const options = defineOptionsMetadata({
  scale: {
    displayName: '缩放级别',
    defaultValue: 'auto',
  },
  originalImageInArticles: {
    displayName: '在专栏中请求原图',
    defaultValue: false,
  },
})
export type Options = OptionsOfMetadata<typeof options>
