import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "gnu.org/emacs",
  name: "emacs",
  programs: [
    "emacs",
  ],
  dependencies: {
    'tree-sitter.github.io': ">=0.20.2<0.26",
    'gnome.org/libxml2': "^2.10.3",
    'invisible-island.net/ncurses': "^6.3.0",
    'libjpeg-turbo.org': "^2.1.5.1",
    'gnu.org/sed': "^4.9.0",
    'gnu.org/texinfo': "^7.0.1",
    'gnu.org/libidn2': "^2.3",
    'gnutls.org': "^3.6",
    'zlib.net': "^1.2",
    linux: {
      'gnu.org/gcc/libgccjit': "*",
    },
  },
  distributable: {
    url: "https://ftp.gnu.org/gnu/emacs/emacs-{{ version.raw }}.tar.xz",
    stripComponents: 1,
  },
  build: {
    script: [
      "./configure $ARGS",
      "make --jobs {{ hw.concurrency }} install",
      {
        run: "mv {{version.marketing}}/lisp .\nmv site-lisp/* lisp\nrmdir site-lisp\nrm {{version.marketing}}/site-lisp/subdirs.el\nrmdir {{version.marketing}}/site-lisp\nmv {{version.marketing}}/etc .\nrmdir {{version.marketing}}",
        'working-directory': "${{prefix}}/share/emacs",
      },
      {
        run: "DIR=$(ls)\nmv $DIR/* .\nrmdir $DIR\nln -s . $DIR",
        'working-directory': "${{prefix}}/libexec/emacs/{{version.marketing}}",
      },
      {
        run: "PDMP=$(find ../libexec/emacs/{{version.marketing}} -name 'emacs-*.pdmp' -type f -print -quit)\ntest -n \"$PDMP\"\nln -s \"$PDMP\" emacs.pdmp\nln -s \"$PDMP\" emacs-{{version.marketing}}.pdmp",
        'working-directory': "${{prefix}}/bin",
      },
    ],
    env: {
      ARGS: [
        "--prefix=\"{{prefix}}\"",
        "--enable-check-lisp-object-type",
        "--disable-silent-rules",
        "--with-gnutls",
        "--without-x",
        "--with-xml2",
        "--without-dbus",
        "--with-modules",
        "--without-ns",
        "--without-imagemagick",
        "--without-selinux",
        "--with-x-toolkit=no",
        "--with-tree-sitter",
      ],
      linux: {
        ARGS: [
          "--with-native-compilation",
        ],
      },
    },
  },
  test: {
    script: [
      "emacs --version | grep \"GNU Emacs {{version.marketing}}\"",
      "emacs --batch --eval=\"(print (+ 2 2))\" | tee four",
      "test $(cat four) = 4",
      "emacs -batch -l $FIXTURE",
      "emacs --batch --eval '(unless (treesit-available-p) (kill-emacs 1))'",
      "emacs --batch --eval '(unless (native-comp-available-p) (kill-emacs 1))'",
      "emacs --batch --eval '(progn (package-initialize) (print (with-output-to-string (package-list-packages))) (kill-emacs))'",
    ],
  },
}
