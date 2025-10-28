import type { HeadConfig } from 'vitepress'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { withPwa } from '@vite-pwa/vitepress'
import { defineConfig } from 'vitepress'
import viteConfig from './vite.config'

// https://vitepress.dev/reference/site-config

const analyticsHead: HeadConfig[] = [
  [
    'script',
    {
      'src': 'https://cdn.usefathom.com/script.js',
      'data-site': 'SULRKVYD',
      'defer': '',
    },
  ],
]

const nav = [
  { text: 'News', link: 'https://stacksjs.org/news' },
  {
    text: 'Changelog',
    link: 'https://github.com/stacksjs/pantry/blob/main/CHANGELOG.md',
  },
  // { text: 'Blog', link: 'https://updates.ow3.org' },
  {
    text: 'Resources',
    items: [
      { text: 'Team', link: '/team' },
      { text: 'Sponsors', link: '/sponsors' },
      { text: 'Partners', link: '/partners' },
      { text: 'Postcardware', link: '/postcardware' },
      { text: 'Stargazers', link: '/stargazers' },
      { text: 'License', link: '/license' },
      {
        items: [
          {
            text: 'Awesome Stacks',
            link: 'https://github.com/stacksjs/awesome-stacks',
          },
          {
            text: 'Contributing',
            link: 'https://github.com/stacksjs/contributing',
          },
        ],
      },
    ],
  },
]

const sidebar = [
  {
    text: 'Get Started',
    items: [
      { text: 'Introduction', link: '/intro' },
      { text: 'Quick Start', link: '/quickstart' },
      { text: 'The Why', link: '/why' },
      { text: 'Installation', link: '/install' },
      { text: 'Basic Usage', link: '/usage' },
      { text: 'Configuration', link: '/config' },
    ],
  },
  {
    text: 'Features',
    items: [
      { text: 'Package Management', link: '/features/package-management' },
      { text: 'Service Management', link: '/features/service-management' },
      { text: 'Environment Management', link: '/features/environment-management' },
      { text: 'Cache Management', link: '/features/cache-management' },
      { text: 'Shim Creation', link: '/features/shim-creation' },
      { text: 'Bun Installation', link: '/features/bun-installation' },
      { text: 'Zsh Installation', link: '/features/zsh-installation' },
      { text: 'PATH Management', link: '/features/path-management' },
    ],
  },
  {
    text: 'Advanced',
    items: [
      { text: 'Custom Shims', link: '/advanced/custom-shims' },
      { text: 'Cross-platform Compatibility', link: '/advanced/cross-platform' },
      { text: 'Performance Optimization', link: '/advanced/performance' },
      { text: 'Cache Optimization', link: '/advanced/cache-optimization' },
      { text: 'PHP Configuration', link: '/advanced/php-configuration' },
      { text: 'Scripts', link: '/scripts' },
    ],
  },
  {
    text: 'Guides',
    items: [
      { text: 'Examples', link: '/examples' },
      { text: 'Migration Guide', link: '/migration' },
      { text: 'Troubleshooting', link: '/troubleshooting' },
      { text: 'FAQ', link: '/faq' },
    ],
  },
  { text: 'API Reference', link: '/api/reference' },
]
const description = 'A lightweight package manager that leverages the Pantry registry to simplify package installation and management.'
const title = 'pantry | A lightweight package manager'

export default withPwa(
  defineConfig({
    lang: 'en-US',
    title: 'pantry',
    description,
    metaChunk: true,
    cleanUrls: true,
    lastUpdated: true,

    head: [
      ['link', { rel: 'icon', type: 'image/svg+xml', href: './images/logo-mini.svg' }],
      ['link', { rel: 'icon', type: 'image/png', href: './images/logo.png' }],
      ['meta', { name: 'theme-color', content: '#0A0ABC' }],
      ['meta', { name: 'title', content: title }],
      ['meta', { name: 'description', content: description }],
      ['meta', { name: 'author', content: 'Stacks.js, Inc.' }],
      ['meta', {
        name: 'tags',
        content: 'pantry, stacksjs, pkgx, pkgm, dev, package manager, homebrew alternative',
      }],

      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:locale', content: 'en' }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],

      ['meta', { property: 'og:site_name', content: 'pantry' }],
      ['meta', { property: 'og:image', content: './images/og-image.jpg' }],
      ['meta', { property: 'og:url', content: 'https://pantry.sh/' }],
      // ['script', { 'src': 'https://cdn.usefathom.com/script.js', 'data-site': '', 'data-spa': 'auto', 'defer': '' }],
      ...analyticsHead,
    ],

    themeConfig: {
      search: {
        provider: 'local',
      },
      logo: {
        light: './images/logo-transparent.svg',
        dark: './images/logo-white-transparent.svg',
      },

      nav,
      sidebar,

      editLink: {
        pattern: 'https://github.com/stacksjs/pantry/edit/main/docs/:path',
        text: 'Edit this page on GitHub',
      },

      footer: {
        message: 'Released under the MIT License.',
        copyright: 'Copyright © 2025-present Stacks.js, Inc.',
      },

      socialLinks: [
        { icon: 'twitter', link: 'https://twitter.com/stacksjs' },
        { icon: 'bluesky', link: 'https://bsky.app/profile/chrisbreuer.dev' },
        { icon: 'github', link: 'https://github.com/stacksjs/pantry' },
        { icon: 'discord', link: 'https://discord.gg/stacksjs' },
      ],

      // algolia: services.algolia,

      // carbonAds: {
      //   code: '',
      //   placement: '',
      // },
    },

    pwa: {
      manifest: {
        theme_color: '#0A0ABC',
      },
    },

    markdown: {
      theme: {
        light: 'github-light',
        dark: 'github-dark',
      },

      codeTransformers: [
        // @ts-expect-error - transformerTwoslash has type compatibility issues
        transformerTwoslash(),
      ],
    },

    vite: viteConfig,
  }),
)
