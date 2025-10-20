import type { LaunchpadConfig } from '@stacksjs/launchpad'

export const config: LaunchpadConfig = {
  dependencies: {
    'bun': '^1.2.19', // Bun runtime (alias)
    // 'bun.sh': '^1.2.19',         // Bun runtime (domain)
    'redis': '^8.0.0', // Redis server (alias)
    'postgresql.org': '^17.2.0', // PostgreSQL database (domain)
  },

  // Or as an array (uses latest versions)
  // dependencies: ['bun.com', 'redisio', 'postgresqlorg'],

  // Or as a string (space-separated, uses latest versions)
  // dependencies: 'bun.com redisio postgresqlorg',

  // Install globally (optional)
  global: false,

  // Enable services to auto-start Redis and PostgreSQL
  services: {
    enabled: true,
    autoStart: true,
    database: {
      username: 'postgres',
      password: 'password',
      authMethod: 'trust',
    },
  },

  verbose: true,
}

export default config
