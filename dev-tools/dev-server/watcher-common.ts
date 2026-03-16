import { Stats, Watching } from 'webpack'

export const watchers: { url: string; instance: Watching | undefined }[] = []

export const stopInstance = (instance: Watching, onClose: () => void) => {
  if (!instance.closed) {
    instance.close(() => {
      onClose()
    })
  }
}

export const defaultWatcherHandler = (
  initCallback: (result: Stats) => void,
  updateCallback: (result: Stats) => void,
) => {
  let lastHash = ''
  return (error: Error | null, result: Stats | undefined) => {
    if (error) {
      console.error(error)
      return
    }
    if (!result) {
      return
    }
    if (result.hash === lastHash) {
      return
    }
    const needLogging = result.hasErrors() || result.hasWarnings()
    if (needLogging) {
      console.log(
        result.toString({
          hash: false,
          assets: false,
          modules: false,
          chunks: false,
          colors: true,
        }),
      )
    }
    if (result.hasErrors()) {
      lastHash = ''
      return
    }
    if (!lastHash) {
      initCallback(result)
    }
    lastHash = result.hash
    updateCallback(result)
  }
}
