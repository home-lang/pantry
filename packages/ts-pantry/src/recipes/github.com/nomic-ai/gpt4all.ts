import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  // gpt4all wraps the compiled `chat` binary (tbin/gpt4all) with two sibling
  // helper scripts (bin/gpt4all + tbin/gpt4all-fetch-model). In pkgx these live
  // as sibling files of package.yml and are copied into buildDir/props/ at build
  // time — propsDir reproduces that, otherwise the `mv props/...` steps fail.
  propsDir: 'props/github.com/nomic-ai/gpt4all',
  domain: 'github.com/nomic-ai/gpt4all',
  name: 'gpt4all',
  programs: [
    'gpt4all',
  ],
  versionSource: {
    type: 'url-pattern',
    url: 'https://github.com/zanussbaum/gpt4all.cpp/archive/41e992905c4de16b0071338caeb730923323c5f9.tar.gz',
    knownVersions: ['2023.03.29'],
  },
  distributable: {
    url: 'https://github.com/zanussbaum/gpt4all.cpp/archive/41e992905c4de16b0071338caeb730923323c5f9.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p {{prefix}}/bin {{prefix}}/tbin',
      'make chat',
      'mv chat {{prefix}}/tbin/gpt4all',
      'mv props/gpt4all {{prefix}}/bin',
      'mv props/gpt4all-fetch-model {{prefix}}/tbin',
    ],
  },
  test: {
    // testing more than this requires downloading the models
    script: [
      '{{prefix}}/tbin/gpt4all --help',
    ],
  },
}
