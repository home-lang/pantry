import type { BuddyBotConfig } from 'buddy-bot'

const config: BuddyBotConfig = {
  repository: {
    owner: 'stacksjs',
    name: 'launchpad',
    provider: 'github',
    // Uses GITHUB_TOKEN by default
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
      // Add packages to ignore here
      // Example: '@types/node', 'eslint'
    ],
  },
  verbose: false,
}

export default config
