import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'lima-vm.io',
  name: 'lima-vm',
  description: 'Linux virtual machines, with a focus on running containers',
  homepage: 'https://lima-vm.io/',
  github: 'https://github.com/lima-vm/lima',
  programs: ['apptainer.lima', 'docker.lima', 'kubectl.lima', 'lima', 'limactl', 'nerdctl.lima', 'podman.lima'],
  versionSource: {
    type: 'github-releases',
    repo: 'lima-vm/lima',
    tagPattern: /^v(.+)$/,
  },
  dependencies: {
    'qemu.org': '*',
  },
  buildDependencies: {
    'go.dev': '*',
    linux: {
      'gnu.org/gcc': '*',
    },
  },
  distributable: {
    url: 'https://github.com/lima-vm/lima/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      {
        run: [
          'sed -i -e \'s/ldflags="/ldflags="-buildmode=pie /\' ../Makefile',
          'ln -s "{{deps.gnu.org/gcc.prefix}}/bin/$ARCH-linux-gnu-gcc" .',
        ],
        'working-directory': '.bin',
        if: 'linux',
      },
      'make $ARGS binaries',
      'mkdir -p {{prefix}}',
      'mv ./_output/* {{prefix}}/',
    ],
    env: {
      ARGS: [
        'VERSION={{version}}',
      ],
      darwin: {
        CC: 'clang',
        CXX: 'clang++',
        LD: 'clang',
      },
      linux: {
        PATH: '$SRCROOT/.bin:$PATH',
        ARGS: [
          'CONFIG_GUESTAGENT_ARCH_ARMV7L=n',
          'CONFIG_GUESTAGENT_ARCH_RISCV64=n',
          'CONFIG_GUESTAGENT_ARCH_S390X=n',
        ],
      },
      'x86-64': {
        ARCH: 'x86_64',
      },
      aarch64: {
        ARCH: 'aarch64',
      },
    },
  },
}
