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
      'rm -rf hwloc* libevent* openpmix*',
      './configure $CONFIGURE_ARGS',
      'make --jobs {{hw.concurrency}} all',
      'make --jobs {{hw.concurrency}} install',
    ],
  },
}
