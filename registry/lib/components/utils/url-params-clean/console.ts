import { useScopedConsole } from '@/core/utils/log'
import { displayName } from './common'

export const console = useScopedConsole(displayName)
