import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'bitwarden.com',
  name: 'bw',
  description: 'Secure and free password manager for all of your devices',
  homepage: 'https://bitwarden.com/',
  github: 'https://github.com/bitwarden/clients',
  programs: ['bw'],
  // CLI versions are published to npm as @bitwarden/cli (calendar versioned).
  // The github tags only expose web-v* / desktop-v* etc., so discover via npm.
  versionSource: {
    type: 'custom',
    fetch: async () => {
      const res = await fetch('https://registry.npmjs.org/@bitwarden/cli')
      const data = (await res.json()) as { versions?: Record<string, unknown> }
      const versions = Object.keys(data.versions ?? {})
      // newest first (numeric sort by major.minor.patch)
      return versions.sort((a, b) => {
        const pa = a.split('.').map(Number)
        const pb = b.split('.').map(Number)
        for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
          const da = pa[i] ?? 0
          const db = pb[i] ?? 0
          if (da !== db)
            return db - da
        }
        return 0
      })
    },
  },
  distributable: {
    url: 'https://registry.npmjs.org/@bitwarden/cli/-/cli-{{version}}.tgz',
    stripComponents: 1,
  },
  dependencies: {
    'nodejs.org': '^20',
  },
  buildDependencies: {
    'npmjs.com': '*',
    'darwin': {
      // needed to work with Xcode >=16.2
      'github.com/fastfloat/fast_float': '^8',
    },
    'linux': {
      // needed to build some native modules
      'python.org': '^3',
    },
  },

  build: {
    script: [
      'npm i husky',
      { run: 'npm i semver', if: '>=2025.5.0' },
      'git init',
      'npm i $ARGS .',
      { run: 'ln -s ../libexec/bin/bw bw', 'working-directory': '{{prefix}}/bin' },
    ],
    env: {
      'linux': {
        CC: 'clang',
        CXX: 'clang++',
        LD: 'clang',
        CXXFLAGS: '-std=c++20',
      },
      'ARGS': [
        '-ddd',
        '--global',
        '--build-from-source',
        '--prefix={{prefix}}/libexec',
        '--install-links',
        '--unsafe-perm',
      ],
    },
  },

  test: {
    script: [
      'bw generate --length 10',
      'echo "Testing" | bw encode | grep \'VGVzdGluZw\'',
      'bw --version | grep {{version}}',
    ],
  },
}
