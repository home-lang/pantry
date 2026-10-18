import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kernel.org/perf', name: 'perf', programs: ['perf'], platforms: ['linux'],
  description: 'Native Linux performance counters, sampling and ELF/DWARF reports.',
  homepage: 'https://perf.wiki.kernel.org/',
  versionSource: {
    type: 'custom',
    fetch: async () => {
      const response = await fetch('https://www.kernel.org/releases.json', { signal: AbortSignal.timeout(15_000) })
      if (!response.ok) throw new Error(`Linux release discovery returned HTTP ${response.status}`)
      const metadata = await response.json() as { releases: Array<{ moniker: string, version: string }> }
      const releases = metadata.releases.filter(release => release.moniker === 'stable' || release.moniker === 'longterm').map(release => release.version)
      if (!releases.length) throw new Error('Linux published no stable perf source versions')
      return releases
    },
  },
  distributable: { url: 'https://cdn.kernel.org/pub/linux/kernel/v{{version.major}}.x/linux-{{version}}.tar.xz', stripComponents: 1 },
  dependencies: { 'elfutils.org': '*', 'zlib.net': '^1', 'tukaani.org/xz': '^5', 'facebook.com/zstd': '^1', 'gnu.org/gcc/libstdcxx': '14' },
  buildDependencies: { 'freedesktop.org/pkg-config': '*', 'gnu.org/bison': '*', 'github.com/westes/flex': '*', 'python.org': '^3' },
  build: {
    script: ['make -C tools/perf --jobs {{hw.concurrency}} $PERF_ARGS', 'make -C tools/perf $PERF_ARGS install-bin'],
    env: {
      PERF_ARGS: [
        'prefix={{prefix}}', 'libdir={{prefix}}/lib', 'perfexecdir={{prefix}}/libexec/perf-core',
        'CC=clang', 'CXX=clang++', 'HOSTCC=clang',
        // The packaged CLI keeps native counters and ELF/libdw unwinding.
        // Language plugins, BPF development and GUI dependencies are separate.
        'NO_LIBPERL=1', 'NO_LIBPYTHON=1', 'NO_LIBUNWIND=1', 'NO_LIBTRACEEVENT=1',
        'NO_LIBBPF=1', 'NO_SDT=1', 'NO_LIBNUMA=1', 'NO_LIBAUDIT=1',
        'NO_LIBCRYPTO=1', 'NO_GTK2=1', 'NO_LIBBFD=1', 'NO_LIBCAP=1', 'NO_JVMTI=1',
        'NO_LIBLLVM=1', 'NO_SLANG=1', 'NO_CAPSTONE=1', 'NO_BABELTRACE2=1', 'NO_LIBPFM4=1',
        'NO_BACKTRACE=1', 'NO_RUST=1',
      ],
    },
  },
  test: {
    required: true,
    script: ['perf --version | grep -F "{{version}}"', 'perf version --build-options | grep -E "libdw-dwarf-unwind:.*on"'],
  },
}
