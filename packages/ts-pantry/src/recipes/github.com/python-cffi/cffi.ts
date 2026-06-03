import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/python-cffi/cffi",
  name: "cffi",
  programs: [],
  dependencies: {
    'python.org': ">=3.11",
    'github.com/eliben/pycparser': "^2.21",
    'sourceware.org/libffi': "^3.4",
  },
  distributable: {
    url: "git+https://github.com/python-cffi/cffi.git",
  },
  build: {
    script: [
      "python -m pip install . --prefix={{prefix}}",
      {
        run: "ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}",
        'working-directory': "${{prefix}}/lib",
      },
    ],
  },
  test: {
    script: [
      "clang -shared sum.c -o $SHARED_LIBRARY",
      "cat << EOF > sum_build.py\nfrom cffi import FFI\nffibuilder = FFI()\n\ndeclaration = \"\"\"\n  int sum(int a, int b);\n\"\"\"\n\nffibuilder.cdef(declaration)\nffibuilder.set_source(\n  \"_sum_cffi\",\n  declaration,\n  libraries=['sum'],\n  extra_link_args=['-L$PWD', '-Wl,-rpath,$PWD']\n)\n\nffibuilder.compile(verbose=True)\nEOF\n",
      "python sum_build.py",
      "python -c \"import _sum_cffi; assert _sum_cffi.lib.sum(1, 2) == 3\"",
    ],
  },
}
