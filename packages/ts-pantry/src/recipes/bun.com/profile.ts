import type { Recipe } from '../../../scripts/recipe-types'
import { githubAssetBuildDependencies, githubAssetSteps } from '../../../scripts/github-asset-recipe'

export const recipe: Recipe = {
  domain: 'bun.com/profile',
  name: 'bun-profile',
  description: 'Official Bun profiling runtime with its native ELF symbols preserved.',
  homepage: 'https://bun.com',
  github: 'https://github.com/oven-sh/bun',
  programs: ['bun-profile'],
  platforms: ['linux/x86-64'],
  versionSource: { type: 'github-releases', repo: 'oven-sh/bun', tagPattern: /^bun-v(.+)$/, stable: true },
  distributable: null,
  buildDependencies: { ...githubAssetBuildDependencies, 'info-zip.org/unzip': '*', 'gnu.org/binutils': '*' },
  build: {
    script: [
      ...githubAssetSteps('oven-sh/bun', 'bun-v{{version}}', 'bun-linux-x64-profile.zip', 'bun-profile.zip'),
      'unzip -q bun-profile.zip',
      'install -Dm755 bun-linux-x64-profile/bun "{{prefix}}/bin/bun-profile"',
    ],
    // Bun's self-contained ELF carries embedded data; preserve the vendor image
    // and symbol table exactly as with the ordinary Bun distribution.
    skip: ['fix-patchelf'],
  },
  test: {
    required: true,
    script: [
      'bun-profile --version | grep -F "{{version}}"',
      'readelf --sections "{{prefix}}/bin/bun-profile" | grep -F .symtab',
      'nm --defined-only "{{prefix}}/bin/bun-profile" | grep -F Bun > /dev/null',
    ],
  },
}
