import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'open-mpi.org',
  name: 'open-mpi',
  description: 'Open MPI main development repository',
  homepage: 'https://www.open-mpi.org',
  github: 'https://github.com/open-mpi/ompi',
  programs: ['mpic++', 'mpiCC', 'mpicc', 'mpicxx', 'mpiexec', 'mpif77', 'mpif90', 'mpifort', 'mpirun', 'ompi_info', 'opal_wrapper'],
  versionSource: {
    type: 'github-releases',
    repo: 'open-mpi/ompi',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://download.open-mpi.org/release/open-mpi/v{{version.marketing}}/openmpi-{{version}}.tar.bz2',
    stripComponents: 1,
  },

  build: {
    script: [
      'run: rm -rf hwloc* libevent* openpmix*',
      './configure $CONFIGURE_ARGS',
      'make --jobs {{ hw.concurrency }} all',
      'make --jobs {{ hw.concurrency }} install',
      'run: sed -i "s|linker_flags=.*|linker_flags=|g" *-wrapper-data.txt',
      'install {{prefix}}/lib/*.mod {{prefix}}/include/',
      'run: |',
      'mpicc hello.c -o hello',
      './hello',
      'mpirun ./hello',
      'mpifort hellof.f90 -o hellof',
      './hellof',
      'mpirun ./hellof',
      'mpifort hellousempi.f90 -o hellousempi',
      './hellousempi',
      'mpirun ./hellousempi',
      'mpifort hellousempif08.f90 -o hellousempif08',
      './hellousempif08',
      'mpirun ./hellousempif08',
      'pkg-config --modversion ompi',
    ],
  },
}
