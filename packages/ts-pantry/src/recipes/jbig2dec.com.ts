import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'jbig2dec.com',
  name: 'jbig2dec',
  description: 'This is a mirror: the canonical repo is: git.ghostscript.com/jbig2dec.git. This repo does not host releases, they are here: https://github.com/ArtifexSoftware/jbig2dec/tags',
  homepage: 'https://jbig2dec.com/',
  github: 'https://github.com/ArtifexSoftware/jbig2dec',
  programs: ['jbig2dec'],
  versionSource: {
    type: 'github-releases',
    repo: 'ArtifexSoftware/jbig2dec',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/gs9531/jbig2dec-0.19.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure --prefix="{{prefix}}"',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
}
