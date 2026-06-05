import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'projectdiscovery.io/nuclei',
  name: 'nuclei',
  programs: [
    'nuclei',
  ],
  // Download official prebuilt binaries instead of compiling from source.
  // Upstream ships multi-platform release zips for every version.
  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+aarch64) ASSET="macOS_arm64" ;;',
      '  darwin+x86-64)  ASSET="macOS_amd64" ;;',
      '  linux+aarch64)  ASSET="linux_arm64" ;;',
      '  linux+x86-64)   ASSET="linux_amd64" ;;',
      'esac',
      'URL="https://github.com/projectdiscovery/nuclei/releases/download/v${VERSION}/nuclei_${VERSION}_${ASSET}.zip"',
      'curl -Lfo nuclei.zip "$URL"',
      'unzip -o nuclei.zip',
      'install -Dm755 nuclei {{prefix}}/bin/nuclei',
    ],
  },
  test: {
    script: [
      '(nuclei -scan-all-ips -disable-update-check example.com 2>&1 || true) | tee nuclei.log',
      'grep "No results found" nuclei.log',
      'nuclei --version 2>&1 | tee nuclei.log',
      'grep {{version}} nuclei.log',
    ],
  },
}
