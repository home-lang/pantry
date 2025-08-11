import type { LaunchpadConfig } from './packages/launchpad/src'

const config: Partial<LaunchpadConfig> = {
  verbose: true,
  // installationPath will be auto-detected based on permissions
  // forceReinstall: false, // uncomment to force reinstall of packages when installing
  shimPath: '~/.local/bin',
  autoAddToPath: true,
}

export default config
