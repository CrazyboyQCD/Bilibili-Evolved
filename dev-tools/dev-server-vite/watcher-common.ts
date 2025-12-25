import type { Stats, MultiStats } from 'webpack'

export const defaultWatcherHandler = (
  onFirstCompile: () => void,
  onCompile: (result: Stats | MultiStats) => void,
) => (error: Error, result: Stats | MultiStats) => {
  if (error) {
    console.error(error)
    return
  }
  onCompile(result)
  onFirstCompile()
}