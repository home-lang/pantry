import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'werf.io',
  name: 'werf',
  description: 'A solution for implementing efficient and consistent software delivery to Kubernetes facilitating best practices.',
  homepage: 'https://werf.io/',
  github: 'https://github.com/werf/werf',
  programs: ['werf'],
  versionSource: {
    type: 'github-releases',
    repo: 'werf/werf',
  },

  // Download official prebuilt binaries instead of compiling from source.
  // Upstream publishes per-version, per-platform binaries via its TUF CDN.
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) PLATFORM="darwin-arm64" ;;',
      '  darwin+x86-64)  PLATFORM="darwin-amd64" ;;',
      '  linux+aarch64)  PLATFORM="linux-arm64" ;;',
      '  linux+x86-64)   PLATFORM="linux-amd64" ;;',
      'esac',
      'URL="https://tuf.werf.io/targets/releases/${VERSION}/${PLATFORM}/bin/werf"',
      'curl -Lfo werf "$URL"',
      'install -Dm755 werf {{prefix}}/bin/werf',
    ],
  },
}
