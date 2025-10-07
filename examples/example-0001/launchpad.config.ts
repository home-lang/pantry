import type { LaunchpadConfig } from '@stacksjs/launchpad'

export const config: LaunchpadConfig = {
  dependencies: {
    'bun': '1.2.21',
    'redis': '7.2.10',
    'postgresql': '17.2.0',
  },

  services: {
    enabled: true,
    autoStart: true,
    database: {
      connection: 'postgres',
      name: 'staging_database',
      username: 'staginguser',
      password: 'staging999',
    },
  },

  verbose: true,
}

export default config
