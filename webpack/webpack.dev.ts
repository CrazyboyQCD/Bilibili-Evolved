import type { Configuration } from '@rspack/core'
import webpack from '@rspack/core'

import previewMeta from '../src/client/bilibili-evolved.preview.meta.json'
import { getBanner, getDefaultConfig } from './webpack.config'

const previewConfig = Object.assign(getDefaultConfig(), {
  entry: './src/client/bilibili-evolved.ts',
  output: {
    filename: 'bilibili-evolved.dev.user.js',
  },
}) as Configuration
previewConfig.plugins.push(
  new webpack.BannerPlugin({
    banner: getBanner(previewMeta),
    raw: true,
    entryOnly: true,
  }),
)

export default previewConfig
