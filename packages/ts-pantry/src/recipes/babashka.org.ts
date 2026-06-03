import type { Recipe } from '../../scripts/recipe-types'

// NOTE: babashka is a GraalVM native-image build (needs GraalVM + lein), which
// pkgx itself does not source-build — upstream marks it `vendored` and unpacks
// the official release tarball. We mirror that: download the prebuilt bb binary
// for the host platform/arch and install it.
//
// Release asset naming (verified against github.com/babashka/babashka releases):
//   linux  x86-64 : babashka-{version}-linux-amd64-static.tar.gz
//   linux  aarch64: babashka-{version}-linux-aarch64-static.tar.gz
//   darwin x86-64 : babashka-{version}-macos-amd64.tar.gz
//   darwin aarch64: babashka-{version}-macos-aarch64.tar.gz
export const recipe: Recipe = {
  domain: 'babashka.org',
  name: 'babashka',
  programs: ['bb'],
  versionSource: {
    type: 'github-releases',
    repo: 'babashka/babashka',
  },
  distributable: null,

  build: {
    script: [
      'case {{hw.platform}}/{{hw.arch}} in',
      '  darwin/aarch64) PLATFORM=macos; ARCH=aarch64; SUFFIX= ;;',
      '  darwin/x86-64)  PLATFORM=macos; ARCH=amd64;   SUFFIX= ;;',
      '  linux/aarch64)  PLATFORM=linux; ARCH=aarch64; SUFFIX=-static ;;',
      '  linux/x86-64)   PLATFORM=linux; ARCH=amd64;   SUFFIX=-static ;;',
      '  *) echo "Unsupported platform: {{hw.platform}}/{{hw.arch}}" && exit 1 ;;',
      'esac',
      'URL="https://github.com/babashka/babashka/releases/download/{{version.tag}}/babashka-{{version}}-${PLATFORM}-${ARCH}${SUFFIX}.tar.gz"',
      'curl -fSL "$URL" | tar zxvf -',
      'install -Dm755 bb {{prefix}}/bin/bb',
    ],
  },
}
