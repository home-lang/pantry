import type { BunPressOptions } from '@stacksjs/bunpress'

export default {
  verbose: false,
  docsDir: './docs',
  outDir: './dist',

  nav: [
    { text: 'Home', link: '/' },
    { text: 'Guide', link: '/intro' },
    { text: 'Quick Start', link: '/quickstart' },
    { text: 'Configuration', link: '/config' },
    { text: 'Features', link: '/features/package-management' },
    {
      text: 'Ecosystem',
      items: [
        { text: 'STX Templating', link: 'https://stx.sh' },
        { text: 'Headwind CSS', link: 'https://headwind.sh' },
        { text: 'Clarity Logging', link: 'https://clarity.sh' },
        { text: 'BunPress Docs', link: 'https://bunpress.sh' },
        { text: 'Stacks Framework', link: 'https://stacksjs.org' },
      ],
    },
    { text: 'GitHub', link: 'https://github.com/stacksjs/pantry' },
  ],

  markdown: {
    title: 'Pantry - Modern Package Management',
    meta: {
      description: 'A lightweight package manager built on pkgx Pantry for fast, isolated, and clean package management that works alongside your existing tools.',
      author: 'Stacks.js',
      keywords: 'package manager, pkgx, pantry, development, environment, bun',
    },

    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/intro' },
            { text: 'Installation', link: '/install' },
            { text: 'Quick Start', link: '/quickstart' },
            { text: 'Configuration', link: '/config' },
          ],
        },
        {
          text: 'Usage',
          items: [
            { text: 'Basic Usage', link: '/usage' },
            { text: 'Why Pantry?', link: '/why' },
            { text: 'Migration Guide', link: '/migration' },
            { text: 'Troubleshooting', link: '/troubleshooting' },
            { text: 'FAQ', link: '/faq' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Package Management', link: '/features/package-management' },
            { text: 'Service Management', link: '/features/service-management' },
            { text: 'Environment Management', link: '/features/environment-management' },
            { text: 'Path Management', link: '/features/path-management' },
            { text: 'Shim Creation', link: '/features/shim-creation' },
            { text: 'Cache Management', link: '/features/cache-management' },
            { text: 'Bun Installation', link: '/features/bun-installation' },
            { text: 'Zsh Installation', link: '/features/zsh-installation' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Custom Shims', link: '/advanced/custom-shims' },
            { text: 'Cache Optimization', link: '/advanced/cache-optimization' },
            { text: 'Cross-Platform', link: '/advanced/cross-platform' },
            { text: 'Performance', link: '/advanced/performance' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'API Reference', link: '/api/reference' },
            { text: 'Scripts', link: '/scripts' },
            { text: 'Lifecycle Scripts', link: '/lifecycle-scripts' },
            { text: 'Examples', link: '/examples' },
          ],
        },
        {
          text: 'Resources',
          items: [
            { text: 'Showcase', link: '/showcase' },
            { text: 'Team', link: '/team' },
            { text: 'Sponsors', link: '/sponsors' },
          ],
        },
      ],
    },

    toc: {
      enabled: true,
      position: 'sidebar',
      title: 'On this page',
      minDepth: 2,
      maxDepth: 4,
      smoothScroll: true,
      activeHighlight: true,
    },

    syntaxHighlightTheme: 'github-dark',

    features: {
      containers: true,
      githubAlerts: true,
      codeBlocks: {
        lineNumbers: true,
        lineHighlighting: true,
        focus: true,
        diffs: true,
        errorWarningMarkers: true,
      },
      codeGroups: true,
      emoji: true,
      badges: true,
    },
  },

  sitemap: {
    enabled: true,
    baseUrl: 'https://pantry.sh',
    priorityMap: {
      '/': 1.0,
      '/intro': 0.9,
      '/install': 0.9,
      '/quickstart': 0.9,
      '/usage': 0.8,
      '/config': 0.8,
      '/features/*': 0.7,
      '/advanced/*': 0.6,
      '/api/*': 0.6,
    },
  },

  robots: {
    enabled: true,
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/draft/'],
      },
    ],
  },

  fathom: {
    enabled: true,
    siteId: 'PANTRY',
    honorDNT: true,
  },
} satisfies BunPressOptions
