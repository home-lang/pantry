import type { LaunchpadConfig } from './types'
// @ts-expect-error the library has type issues atm
import { loadConfig } from 'bunfig'

export const defaultConfig: LaunchpadConfig = {
  verbose: true,
}

// eslint-disable-next-line antfu/no-top-level-await
export const config: LaunchpadConfig = await loadConfig({
  name: 'launchpad',
  defaultConfig,
})
