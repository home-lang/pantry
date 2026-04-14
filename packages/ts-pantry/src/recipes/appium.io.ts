import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'appium.io',
  name: 'appium',
  description: 'Cross-platform automation framework for all kinds of apps, built on top of the W3C WebDriver protocol',
  homepage: 'https://appium.io/',
  github: 'https://github.com/appium/appium',
  programs: ['appium'],
  versionSource: {
    type: 'github-releases',
    repo: 'appium/appium',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://registry.npmjs.org/appium/-/appium-{{version}}.tgz',
    stripComponents: 1,
  },
  dependencies: {
    'npmjs.com': '*',
    'nodejs.org': '^10.13.0 || ^12 || ^14 || ^16 || ^18 || ^20',
    'openjdk.org': '*',
  },
  buildDependencies: {},

  build: {
    script: [
      'chmod +x lib/appium.js',
      'EXTRA_PACKAGES="@appium/logger"',
      'npm install . $EXTRA_PACKAGES --global --prefix="{{prefix}}" --install-links',
    ],
  },
}
