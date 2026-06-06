import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dotnet.microsoft.com',
  name: 'dotnet',
  description: 'Home of the .NET platform',
  homepage: 'https://dotnet.microsoft.com/',
  github: 'https://github.com/dotnet/dotnet',
  programs: ['dotnet'],
  versionSource: {
    type: 'github-tags',
    repo: 'dotnet/sdk',
    tagPattern: /^v(.+)$/,
  },
  distributable: null,
  dependencies: {
    linux: {
      'unicode.org': '^71',
      'openssl.org': '*',
    },
  },
  buildDependencies: {
    'curl.se': '*',
  },

  build: {
    // The .NET SDK is shipped by upstream as a prebuilt, vendored archive.
    // Mirror pkgx: download the official tarball into {{prefix}} and symlink
    // the launcher into bin/. PLATFORM selects the right tarball per os/arch.
    workingDirectory: '{{prefix}}',
    env: {
      'darwin/aarch64': { PLATFORM: 'osx-arm64' },
      'darwin/x86-64': { PLATFORM: 'osx-x64' },
      'linux/aarch64': { PLATFORM: 'linux-arm64' },
      'linux/x86-64': { PLATFORM: 'linux-x64' },
    },
    script: [
      'curl -L "https://builds.dotnet.microsoft.com/dotnet/Sdk/{{version}}/dotnet-sdk-{{version}}-${PLATFORM}.tar.gz" | tar zxf -',
      {
        run: 'ln -s ../dotnet ./dotnet',
        'working-directory': '{{prefix}}/bin',
      },
    ],
  },
}
