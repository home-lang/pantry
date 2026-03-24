import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dotnet.microsoft.com',
  name: 'dotnet',
  description: 'Home of .NET\\',
  homepage: 'https://dotnet.microsoft.com/',
  github: 'https://github.com/dotnet/dotnet',
  programs: ['dotnet'],
  versionSource: {
    type: 'github-releases',
    repo: 'dotnet/sdk/tags',
    tagPattern: /\/v\//,
  },
  distributable: {
    url: 'https://github.com/dotnet/sdk/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'curl.se': '*',
  },

  build: {
    script: [
      'curl -L "https://dotnetcli.azureedge.net/dotnet/Sdk/{{version}}/dotnet-sdk-{{version}}-${PLATFORM}.tar.gz" | tar zxf -',
      'cd "{{prefix}}/bin"',
      'ln -s ../dotnet ./dotnet',
    ],
  },
}
