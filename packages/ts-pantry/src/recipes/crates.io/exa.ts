import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/exa',
  name: 'exa',
  programs: [
    'exa',
  ],
  versionSource: {
    type: 'github-releases',
    repo: 'ogham/exa',
  },
  platforms: ['darwin/x86-64', 'linux/x86-64'],
  // Prebuilt download: exa is abandoned (superseded by eza) and never builds
  // cleanly on current toolchains, but upstream's final release ships official
  // prebuilt zips (`exa-<os>-x86_64-v<ver>.zip` → `bin/exa` + completions/man).
  // Upstream only ever shipped x86-64 for macOS and Linux — there is no arm64
  // build for either OS, so those platforms are gated out.
  distributable: null,

  build: {
    script: [
      'VERSION={{version}}',
      'case {{hw.platform}}+{{hw.arch}} in',
      '  darwin+x86-64) ASSET="macos-x86_64" ;;',
      '  linux+x86-64)  ASSET="linux-x86_64" ;;',
      '  *) echo "unsupported platform: {{hw.platform}}+{{hw.arch}} (exa ships x86-64 only)" >&2; exit 1 ;;',
      'esac',
      '',
      'curl -Lfo exa.zip "https://github.com/ogham/exa/releases/download/v${VERSION}/exa-${ASSET}-v${VERSION}.zip"',
      'unzip -o exa.zip',
      'install -Dm755 bin/exa {{prefix}}/bin/exa',
      'install -Dm644 man/exa.1 {{prefix}}/share/man/man1/exa.1',
      'install -Dm644 man/exa_colors.5 {{prefix}}/share/man/man5/exa_colors.5',
    ],
  },

  test: {
    script: [
      'exa --version',
    ],
  },
}
