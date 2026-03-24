import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'capstone-engine.org',
  name: 'cstool',
  description: 'Capstone disassembly/disassembler framework for ARM, ARM64 (ARMv8), Alpha, BPF, Ethereum VM, HPPA, LoongArch, M68K, M680X, Mips, MOS65XX, PPC, RISC-V(rv32G/rv64G), SH, Sparc, SystemZ, TMS320C64X, TriCore, Webassembly, XCore and X86.',
  homepage: 'https://www.capstone-engine.org/',
  github: 'https://github.com/capstone-engine/capstone',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'capstone-engine/capstone',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/capstone-engine/capstone/archive/{{version.raw}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './make.sh',
      'make install PREFIX={{ prefix }}',
      'run: sed -i -e \\s_^includedir=.*$_includedir=${libdir}/../include_\\ capstone.pc',
      'run: gcc $FIXTURE -lcapstone -o test',
      './test | tee out',
      'echo "" >>out',
      'run: diff -uw out $FIXTURE',
    ],
  },
}
