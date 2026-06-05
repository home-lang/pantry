import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'conftest.dev',
  name: 'conftest',
  description: 'Write tests against structured configuration data using the Open Policy Agent Rego query language',
  homepage: 'https://www.conftest.dev/',
  github: 'https://github.com/open-policy-agent/conftest',
  programs: ['conftest'],
  versionSource: {
    type: 'github-releases',
    repo: 'open-policy-agent/conftest',
  },
  // Prebuilt download: conftest ships official per-platform release tarballs
  // (capitalized OS + x86_64; bare `conftest` binary at the archive root).
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="conftest_${VERSION}_Darwin_arm64"  ;;',
      '  darwin+x86-64)  ASSET="conftest_${VERSION}_Darwin_x86_64" ;;',
      '  linux+aarch64)  ASSET="conftest_${VERSION}_Linux_arm64"   ;;',
      '  linux+x86-64)   ASSET="conftest_${VERSION}_Linux_x86_64"  ;;',
      'esac',
      '',
      'curl -Lfo conftest.tar.gz "https://github.com/open-policy-agent/conftest/releases/download/v${VERSION}/${ASSET}.tar.gz"',
      'tar xf conftest.tar.gz',
      'install -Dm755 conftest {{prefix}}/bin/conftest',
    ],
  },
}
