import { defineOptionsMetadata } from '@/components/define'
import { DefaultDashExtensions, DashCodec } from './apis/dash-base'

export const options = defineOptionsMetadata({
  basicConfig: {
    defaultValue: {},
    displayName: '基础配置',
    hidden: true,
  },
  dashVideoExtension: {
    defaultValue: DefaultDashExtensions.video,
    displayName: 'DASH 视频扩展名',
  },
  dashAudioExtension: {
    defaultValue: DefaultDashExtensions.audio,
    displayName: 'DASH 普通音频扩展名',
  },
  dashFlacAudioExtension: {
    defaultValue: DefaultDashExtensions.flacAudio,
    displayName: 'DASH FLAC 音频扩展名',
  },
  dashCodecFallback: {
    defaultValue: DashCodec.Avc,
    dropdownEnum: DashCodec,
    displayName: 'DASH 回退编码',
  },
})
