import type { Recipe } from '../../../../scripts/recipe-types'
import { githubAssetBuildDependencies, githubAssetSteps } from '../../../../scripts/github-asset-recipe'

export const recipe: Recipe = {
  domain: 'github.com/firecracker-microvm/firecracker',
  name: 'firecracker',
  description: 'Native KVM microVM monitor and jailer.',
  homepage: 'https://firecracker-microvm.github.io',
  github: 'https://github.com/firecracker-microvm/firecracker',
  programs: ['firecracker', 'jailer'],
  platforms: ['linux/x86-64'],
  versionSource: { type: 'github-releases', repo: 'firecracker-microvm/firecracker', tagPattern: /^v(.+)$/, stable: true },
  distributable: null,
  buildDependencies: githubAssetBuildDependencies,
  build: {
    script: [
      ...githubAssetSteps('firecracker-microvm/firecracker', 'v{{version}}', 'firecracker-v{{version}}-x86_64.tgz', 'firecracker.tgz'),
      'tar -xf firecracker.tgz',
      'install -Dm755 release-v{{version}}-x86_64/firecracker-v{{version}}-x86_64 "{{prefix}}/bin/firecracker"',
      'install -Dm755 release-v{{version}}-x86_64/jailer-v{{version}}-x86_64 "{{prefix}}/bin/jailer"',
    ],
  },
  test: { required: true, script: ['firecracker --version | grep -F "{{version}}"', 'jailer --version | grep -F "{{version}}"'] },
}
