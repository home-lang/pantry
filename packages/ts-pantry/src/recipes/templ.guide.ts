import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'templ.guide',
  name: 'templ',
  description: 'A language for writing HTML user interfaces in Go.',
  homepage: 'https://templ.guide',
  github: 'https://github.com/a-h/templ',
  programs: ['templ'],
  versionSource: {
    type: 'github-releases',
    repo: 'a-h/templ',
  },
  // Prebuilt download: templ ships official per-platform release tarballs
  // (capitalized OS + x86_64; bare `templ` binary at the archive root).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="templ_Darwin_arm64"  ;;',
      '  darwin+x86-64)  ASSET="templ_Darwin_x86_64" ;;',
      '  linux+aarch64)  ASSET="templ_Linux_arm64"   ;;',
      '  linux+x86-64)   ASSET="templ_Linux_x86_64"  ;;',
      'esac',
      '',
      'curl -Lfo templ.tar.gz "https://github.com/a-h/templ/releases/download/v${VERSION}/${ASSET}.tar.gz"',
      'tar xf templ.tar.gz',
      'install -Dm755 templ {{prefix}}/bin/templ',
    ],
  },
}
