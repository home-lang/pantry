import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'aquasecurity.github.io/trivy',
  name: 'trivy',
  programs: [
    'trivy',
  ],
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  versionSource: {
    type: 'github-releases',
    repo: 'aquasecurity/trivy',
  },
  // Prebuilt download: Trivy ships official per-platform release tarballs
  // (`trivy_<ver>_<OS>-<ARCH>.tar.gz`) containing a single flat `trivy` binary.
  // It's a vanilla Go CLI with no build-time configuration we customize, so the
  // official binary is identical to what we'd compile — and the source build
  // was failing on the GOEXPERIMENT=jsonv2 toolchain gating.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="macOS-ARM64" ;;',
      '  darwin+x86-64)  ASSET="macOS-64bit" ;;',
      '  linux+aarch64)  ASSET="Linux-ARM64" ;;',
      '  linux+x86-64)   ASSET="Linux-64bit" ;;',
      'esac',
      '',
      'curl -Lfo trivy.tar.gz "https://github.com/aquasecurity/trivy/releases/download/v${VERSION}/trivy_${VERSION}_${ASSET}.tar.gz"',
      'tar xzf trivy.tar.gz',
      'install -Dm755 trivy {{prefix}}/bin/trivy',
    ],
  },

  test: {
    script: [
      'trivy --version | grep {{version}}',
    ],
  },
}
