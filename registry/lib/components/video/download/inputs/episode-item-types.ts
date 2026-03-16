import { DownloadVideoInputItem } from '../types'

export interface EpisodeItem {
  key: string
  title: string
  isChecked: boolean
  inputItem: DownloadVideoInputItem
  durationText?: string
}
