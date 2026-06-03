import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "gnu.org/texinfo",
  name: "texinfo",
  programs: [
    "info",
    "install-info",
    "makeinfo",
    "pdftexi2dvi",
    "pod2texi",
    "texi2any",
    "texi2dvi",
    "texi2pdf",
    "texindex",
  ],
  dependencies: {
    'perl.org': "~5.42",
  },
  buildDependencies: {
    'gnu.org/gettext': "*",
    'invisible-island.net/ncurses': "*",
  },
  distributable: {
    url: "https://ftp.gnu.org/gnu/texinfo/texinfo-{{ version.raw }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "./configure --prefix={{ prefix }}",
      "make --jobs {{ hw.concurrency }} install",
      {
        run: "sed -i \"1s_#! .*/perl_#!/usr/bin/env perl_\" pod2texi texi2any makeinfo\nhead makeinfo",
        'working-directory': "${{prefix}}/bin",
      },
    ],
  },
  test: {
    script: [
      "makeinfo $FIXTURE",
      "grep -q 'Hello World!' $(basename $FIXTURE).info",
    ],
  },
}
