import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'zig-dtsx.stacksjs.org',
  name: 'zig-dtsx',
  description: 'High-performance .d.ts emitter for TypeScript, written in Zig. Ships as a standalone CLI; the JS library form is published separately as @stacksjs/zig-dtsx on npm.',
  homepage: 'https://github.com/stacksjs/dtsx#readme',
  github: 'https://github.com/stacksjs/dtsx',
  programs: ['zig-dtsx'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'linux/aarch64', 'linux/x86-64'],

  versionSource: {
    type: 'github-releases',
    repo: 'stacksjs/dtsx',
    tagPattern: /^v(.+)$/,
  },

  build: {
    script: [
      'case "{{hw.platform}}+{{hw.arch}}" in',
      '  darwin+aarch64) PLATFORM="darwin-arm64" ;;',
      '  darwin+x86-64)  PLATFORM="darwin-x64"  ;;',
      '  linux+aarch64)  PLATFORM="linux-arm64" ;;',
      '  linux+x86-64)   PLATFORM="linux-x64"   ;;',
      '  *)              echo "unsupported platform: {{hw.platform}}+{{hw.arch}}" >&2; exit 1 ;;',
      'esac',
      '',
      'curl -fSL -L "https://github.com/stacksjs/dtsx/releases/download/v{{version}}/zig-dtsx-${PLATFORM}.zip" -o zig-dtsx.zip',
      'unzip -q zig-dtsx.zip',
      'install -Dm755 zig-dtsx "{{prefix}}/bin/zig-dtsx"',
    ],
  },
}
