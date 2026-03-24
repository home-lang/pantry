import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'qpdf.sourceforge.io',
  name: 'qpdf',
  description: 'qpdf: A content-preserving PDF document transformer',
  homepage: 'https://qpdf.sourceforge.io/',
  github: 'https://github.com/qpdf/qpdf',
  programs: ['qpdf'],
  versionSource: {
    type: 'github-releases',
    repo: 'qpdf/qpdf',
  },
  distributable: {
    url: 'https://github.com/qpdf/qpdf/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '^1',
    'libjpeg-turbo.org': '^2',
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'cmake.org': '^3',
    'pyyaml.org/libyaml': '*',
    'python.org': '^3',
    'pip.pypa.io': '*',
  },

  build: {
    script: [
      'python -m venv venv',
      'source venv/bin/activate',
      'pip install pyyaml',
      'cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=1 -DMAINTAINER_MODE=1 -DBUILD_STATIC_LIBS=0 -DCMAKE_INSTALL_PREFIX={{ prefix }} -DCMAKE_BUILD_TYPE=Release -DBUILD_DOC=0 -DCMAKE_CXX_STANDARD=20 -DCMAKE_CXX_STANDARD_REQUIRED=ON ..',
      'cmake --build .',
      'cmake --install .',
    ],
  },
}
