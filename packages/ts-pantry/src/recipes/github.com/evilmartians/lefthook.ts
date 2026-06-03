import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/evilmartians/lefthook',
  name: 'lefthook',
  programs: [
    'lefthook',
  ],
  buildDependencies: {
    'curl.se': '*',
  },
  distributable: {
    url: 'https://github.com/evilmartians/lefthook/archive/refs/tags/v{{version}}.tar.gz',
  },
  build: {
    script: [
      'if test {{hw.platform}}+{{hw.arch}} == "darwin+x86-64"; then',
      '	curl -sSfL --output lefthook.gz "${DOWNLOAD_BASE}/v{{version}}/lefthook_{{version}}_MacOS_x86_64.gz"',
      'elif test {{hw.platform}}+{{hw.arch}} == "darwin+aarch64"; then',
      '	curl -sSfL --output lefthook.gz "${DOWNLOAD_BASE}/v{{version}}/lefthook_{{version}}_MacOS_arm64.gz"',
      'elif test {{hw.platform}}+{{hw.arch}} == "linux+x86-64"; then',
      '	curl -sSfL --output lefthook.gz "${DOWNLOAD_BASE}/v{{version}}/lefthook_{{version}}_Linux_x86_64.gz"',
      'elif test {{hw.platform}}+{{hw.arch}} == "linux+aarch64"; then',
      '	curl -sSfL --output lefthook.gz "${DOWNLOAD_BASE}/v{{version}}/lefthook_{{version}}_Linux_arm64.gz"',
      'elif test {{hw.platform}}+{{hw.arch}} == "windows+x86-64"; then',
      '	curl -sSfL --output lefthook.gz "${DOWNLOAD_BASE}/v{{version}}/lefthook_{{version}}_Windows_x86_64.gz"',
      'elif test {{hw.platform}}+{{hw.arch}} == "windows+aarch64"; then',
      '	curl -sSfL --output lefthook.gz "${DOWNLOAD_BASE}/v{{version}}/lefthook_{{version}}_Windows_arm64.gz"',
      'fi',
      'gunzip --force lefthook.gz',
      'mkdir -p {{ prefix }}/bin',
      'chmod +x lefthook',
      'if test {{hw.platform}} == "windows"; then',
      '    mv lefthook bin/lefthook.exe',
      'else',
      '    mv lefthook bin/',
      'fi',
    ],
    env: {
      DOWNLOAD_BASE: 'https://github.com/evilmartians/lefthook/releases/download',
    },
  },
}
