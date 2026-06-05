import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'open-mpi.org',
  name: 'open-mpi',
  description: 'Open MPI main development repository',
  homepage: 'https://www.open-mpi.org',
  github: 'https://github.com/open-mpi/ompi',
  programs: ['mpic++', 'mpiCC', 'mpicc', 'mpicxx', 'mpiexec', 'mpif77', 'mpif90', 'mpifort', 'mpirun', 'ompi_info', 'opal_wrapper'],
  platforms: ['linux', 'darwin/aarch64'], // fortran not happy on increasingly ancient darwin/x86-64
  versionSource: {
    type: 'github-tags',
    repo: 'open-mpi/ompi',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://download.open-mpi.org/release/open-mpi/v{{version.marketing}}/openmpi-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  dependencies: {
    'open-mpi.org/hwloc': '*',
    'openpmix.github.io': '5',
    'libevent.org': '*',
  },
  buildDependencies: {
    'zlib.net': '^1',
    'python.org': '^3',
    // needed for gfortran
    'gnu.org/binutils': '*',
    'gnu.org/gcc': '*',
  },

  build: {
    script: [
      {
        run: 'rm -rf hwloc* libevent* openpmix*',
        'working-directory': '3rd-party',
      },
      './configure $CONFIGURE_ARGS',
      'make --jobs {{hw.concurrency}} all',
      'make --jobs {{hw.concurrency}} install',
      {
        run: 'sed -i "s|linker_flags=.*|linker_flags=|g" *-wrapper-data.txt',
        'working-directory': '{{prefix}}/share/openmpi',
      },
      // Only copy Fortran .mod files if the build actually produced any —
      // a bare `install {{prefix}}/lib/*.mod` aborts with "cannot stat '*.mod'"
      // when the glob matches nothing (e.g. no gfortran modules emitted).
      'for _m in {{prefix}}/lib/*.mod; do [ -e "$_m" ] && install "$_m" {{prefix}}/include/ || true; done',
    ],
    env: {
      CXXFLAGS: ['-std=c++11'],
      darwin: {
        // prevent gcc from taking over
        CC: 'clang',
        CXX: 'clang++',
        LD: '/usr/bin/ld',
        CFLAGS: [
          '-Wl,-rpath,{{prefix}},-headerpad_max_install_names',
          '-Wno-unused-command-line-argument',
        ],
        CXXFLAGS: [
          '-Wl,-rpath,{{prefix}},-headerpad_max_install_names',
          '-Wno-unused-command-line-argument',
        ],
        FCFLAGS: [
          '-Wl,-rpath,{{prefix}},-headerpad_max_install_names',
          '-Wno-unused-command-line-argument',
        ],
        LDFLAGS: [
          '-Wl,-headerpad_max_install_names',
          '-Wno-unused-command-line-argument',
        ],
      },
      CONFIGURE_ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--disable-silent-rules',
        '--enable-ipv6',
        '--enable-mca-no-build=reachable-netlink',
        '--sysconfdir={{prefix}}/etc',
        '--with-libevent={{deps.libevent.org.prefix}}',
        '--with-hwloc={{deps.open-mpi.org/hwloc.prefix}}',
        '--with-pmix={{deps.openpmix.github.io.prefix}}',
        '--with-sge',
        '--disable-dlopen',
      ],
    },
  },
}
