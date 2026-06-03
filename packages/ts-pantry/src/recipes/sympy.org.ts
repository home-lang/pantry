import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sympy.org',
  name: 'sympy',
  description: 'A computer algebra system written in pure Python',
  homepage: 'https://sympy.org/',
  github: 'https://github.com/sympy/sympy',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'sympy/sympy',
    tagPattern: /^sympy-(.+)$/,
  },
  distributable: {
    url: 'git+https://github.com/sympy/sympy.git',
    // pkgx pins the git checkout to the release tag (`ref: $sympy-{{version}}`).
    // Without this the buildkit clones the default branch (master) — a moving
    // target whose release.py wouldn't match the version being built. The
    // buildkit reads `distributable.ref`; sympy tags are `sympy-{version}` and
    // the github-releases source strips `sympy-`, so `version.tag` resolves to
    // the original `sympy-{version}` tag.
    ref: 'sympy-{{version}}',
  } as Recipe['distributable'] & { ref: string },
  dependencies: {
    'python.org': '>=3.11',
  },

  build: {
    // Mirrors the upstream pkgx recipe. The git source is checked out into the
    // build root, so setup.py lives at the build root (pip install .) while
    // release.py lives at sympy/release.py — hence the per-step
    // working-directory. The old recipe wrongly `cd "sympy"`'d for the pip
    // install, which ran in the package subdir that has no setup.py.
    script: [
      {
        run: 'sed -i \'s/__version__ =.*/__version__ = "{{version.raw}}"/\' release.py',
        'working-directory': 'sympy',
      },
      'python -m pip install --prefix={{prefix}} .',
      {
        run: 'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
        'working-directory': '${{prefix}}/lib',
      },
    ],
  },
}
