import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'poppler.freedesktop.org',
  name: 'poppler.freedesktop',
  description: '',
  homepage: '',
  programs: ['pdfattach', 'pdfdetach', 'pdffonts', 'pdfimages', 'pdfinfo', 'pdfseparate', 'pdftocairo', 'pdftohtml', 'pdftoppm', 'pdftops', 'pdftotext', 'pdfunite'],

  build: {
    script: [
    '# Poppler uses zero-padded month in tarball names (e.g. 26.03.0)',
    'IFS="." read -r YEAR MONTH PATCH <<< "{{version}}"',
    'MONTH_PAD=$(printf "%02d" "$MONTH")',
    'PADDED_VER="${YEAR}.${MONTH_PAD}.${PATCH}"',
    'curl -fSL "https://poppler.freedesktop.org/poppler-${PADDED_VER}.tar.xz" | tar xJ --strip-components=1',
    'echo placeholder',
    ],
  },
}
