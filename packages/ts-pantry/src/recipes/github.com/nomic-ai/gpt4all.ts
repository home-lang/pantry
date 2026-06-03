import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/nomic-ai/gpt4all',
  name: 'gpt4all',
  programs: [
    'gpt4all',
  ],
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
}
