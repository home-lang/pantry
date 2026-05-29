import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'numpy.org',
  name: 'f2py',
  description: 'The fundamental package for scientific computing with Python.',
  homepage: 'https://www.numpy.org/',
  github: 'https://github.com/numpy/numpy',
  programs: ['f2py'],
  versionSource: {
    type: 'github-releases',
    repo: 'numpy/numpy',
  },
  distributable: {
    url: 'https://github.com/numpy/numpy/releases/download/v{{version}}/numpy-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openblas.net': '^0.3',
    'python.org': '^3.11',
  },
  buildDependencies: {
    'cython.org/libcython': '*',
    'llvm.org': '*',
    // gfortran — numpy probes for a Fortran compiler; without it the build
    // fails with "configure: error: Cannot continue." (pkgx lists this as a
    // companion for gfortran)
    'gnu.org/gcc': '*',
  },

  build: {
    script: [
      'cat <<EOF > site.cfg',
      '[openblas]',
      'libraries = openblas',
      'library_dirs = {{deps.openblas.net.prefix}}/lib',
      'include_dirs = {{deps.openblas.net.prefix}}/include',
      'EOF',
      '',
      'python -m pip install --prefix={{prefix}} .',
      'cd "${{prefix}}/lib"',
      'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
      'cd "${{prefix}}/bin"',
      'sed -i.bak "s|{{deps.python.org.prefix}}/bin/python|/usr/bin/env python|g" f2py',
      'rm f2py.bak',
      '',
    ],
    env: {
      // ld unrecognized option '--version'
      'CC': 'clang',
      'CXX': 'clang++',
      'LD': 'clang',
      'ATLAS': 'None',
      'darwin': {
        BLAS: '{{deps.openblas.net.prefix}}/lib/libopenblas.dylib',
        LAPACK: '{{deps.openblas.net.prefix}}/lib/libopenblas.dylib',
      },
      'linux': {
        BLAS: '{{deps.openblas.net.prefix}}/lib/libopenblas.so',
        LAPACK: '{{deps.openblas.net.prefix}}/lib/libopenblas.so',
      },
    },
  },
}
