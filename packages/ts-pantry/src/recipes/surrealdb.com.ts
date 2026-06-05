import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'surrealdb.com',
  name: 'surreal',
  description: 'A scalable, distributed, collaborative, document-graph database, for the realtime web',
  homepage: 'https://surrealdb.com',
  github: 'https://github.com/surrealdb/surrealdb',
  programs: ['surreal'],
  versionSource: {
    type: 'github-releases',
    repo: 'surrealdb/surrealdb',
  },
  // Prebuilt download: SurrealDB ships official per-platform release archives
  // (`surreal-v<ver>.<os>-<arch>.tgz`) containing a single flat `surreal`
  // binary. This is the upstream-distributed server binary — building it from
  // source via cargo is slow and brittle (rquickjs-sys patches, recursion-limit
  // tweaks, openssl) for no value-add over the official release.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="darwin-arm64" ;;',
      '  darwin+x86-64)  ASSET="darwin-amd64" ;;',
      '  linux+aarch64)  ASSET="linux-arm64"  ;;',
      '  linux+x86-64)   ASSET="linux-amd64"  ;;',
      'esac',
      '',
      'curl -Lfo surreal.tgz "https://github.com/surrealdb/surrealdb/releases/download/v${VERSION}/surreal-v${VERSION}.${ASSET}.tgz"',
      'tar xzf surreal.tgz',
      'install -Dm755 surreal {{prefix}}/bin/surreal',
    ],
  },

  test: {
    script: [
      'surreal version',
    ],
  },
}
