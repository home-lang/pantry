import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'typesense.org',
  name: 'typesense',
  description: 'Fast, typo-tolerant search engine for building delightful search experiences',
  homepage: 'https://typesense.org',
  github: 'typesense/typesense',
  programs: ['typesense-server'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'linux/aarch64', 'linux/x86-64'],

  versionSource: {
    type: 'github-releases',
    repo: 'typesense/typesense',
    tagPattern: /^v(.+)$/,
  },

  // Pre-built per-platform binaries from dl.typesense.org. The archive is flat:
  // it contains `typesense-server` plus a `.md5.txt` checksum file.
  distributable: null,

  build: {
    script: [
      'if test {{hw.arch}} = "aarch64"; then ARCH="arm64"; else ARCH="amd64"; fi',
      'curl -fSL "https://dl.typesense.org/releases/{{version}}/typesense-server-{{version}}-{{hw.platform}}-${ARCH}.tar.gz" -o typesense.tar.gz',
      'tar xzf typesense.tar.gz',
      'chmod +x typesense-server',
      'mkdir -p {{prefix}}/bin',
      'mv typesense-server {{prefix}}/bin/',
    ],
  },
}
