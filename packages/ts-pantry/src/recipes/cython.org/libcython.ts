import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "cython.org/libcython",
  name: "libcython",
  programs: [],
  dependencies: {
    'python.org': "~3.11",
  },
  distributable: {
    url: "https://github.com/cython/cython/archive/{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "python -m pip install --prefix={{prefix}}/libexec .",
      {
        run: "ln -s ../libexec/lib/python{{deps.python.org.version.marketing}} python{{deps.python.org.version.marketing}}\nln -s ../libexec/lib/python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}\n",
        'working-directory': "{{prefix}}/lib",
      },
    ],
  },
  test: {
    script: [
      "python setup.py build_ext --inplace",
      "python -c \"import package_manager\" | grep \"You are using tea\"",
    ],
  },
}
