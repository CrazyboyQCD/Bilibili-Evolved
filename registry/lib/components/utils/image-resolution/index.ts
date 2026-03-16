import { defineComponentMetadata } from '@/components/define'
import { startResolution } from './resolution'
import { options } from './options'

export const component = defineComponentMetadata({
  name: 'imageResolution',
  displayName: '高分辨率图片',
  tags: [componentsTags.utils],
  enabledByDefault: window.devicePixelRatio > 1,
  entry: startResolution,
  options,
})
