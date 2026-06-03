import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/git-ecosystem/git-credential-manager",
  name: "git-credential-manager",
  programs: [
    "git-credential-manager",
  ],
  dependencies: {
    'openssl.org': "^1.1.1",
    'unicode.org': "^71",
    'zlib.net': "^1.3",
    'dotnet.microsoft.com': "^10.0",
  },
  buildDependencies: {
    'git-scm.org': "^2.27.0",
    'kerberos.org': "^1.21.3",
    linux: {
      'gnu.org/gcc': ">=12",
    },
  },
  distributable: {
    url: "https://github.com/git-ecosystem/git-credential-manager/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "dotnet build ${CSPROJ} -p:InstallFromSource=true -p:installPrefix={{prefix}} --no-self-contained --configuration=${CONFIGURATION} --runtime=${RUNTIME}",
      {
        run: "rm -rf {{prefix}}\nmkdir -p {{prefix}}/bin\ncp -aR * {{prefix}}/bin",
        if: "darwin || linux/aarch64",
        'working-directory': "out/shared/Git-Credential-Manager/bin/${CONFIGURATION}/net{{deps.dotnet.microsoft.com.version.marketing}}/${RUNTIME}",
      },
    ],
    env: {
      DOTNET_CLI_TELEMETRY_OPTOUT: 1,
      linux: {
        CSPROJ: "src/linux/Packaging.Linux/*.csproj",
        CONFIGURATION: "LinuxRelease",
      },
      'linux/x86-64': {
        RUNTIME: "linux-x64",
      },
      'linux/aarch64': {
        RUNTIME: "linux-arm64",
      },
      darwin: {
        CSPROJ: "src/osx/Installer.Mac/*.csproj",
        CONFIGURATION: "MacRelease",
      },
      'darwin/x86-64': {
        RUNTIME: "osx-x64",
      },
      'darwin/aarch64': {
        RUNTIME: "osx-arm64",
      },
    },
  },
}
