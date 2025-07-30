import type { BuddyBotConfig } from 'buddy-bot'

const config: BuddyBotConfig = {
  repository: {
    owner: 'stacksjs',
    name: 'launchpad',
    provider: 'github',
    // token: process.env.BUDDY_BOT_TOKEN,
  },
  dashboard: {
    enabled: true,
    title: 'Dependency Updates Dashboard',
    // issueNumber: undefined, // Auto-generated
  },
  workflows: {
    enabled: true,
    outputDir: '.github/workflows',
    templates: {
      daily: true,
      weekly: true,
      monthly: true,
    },
    custom: [],
  },
  packages: {
    strategy: 'all',
    ignore: [
      'bun-plugin-dtsx',
    ],
    ignorePaths: [
      'packages/launchpad/test-envs/**',
      'packages/launchpad/test/**',
    ],
  },
  verbose: false,
}

export default config
