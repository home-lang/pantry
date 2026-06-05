import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'htslib.org/samtools',
  name: 'samtools',
  programs: [
    'ace2sam',
    'blast2sam.pl',
    'bowtie2sam.pl',
    'export2sam.pl',
    'fasta-sanitize.pl',
    'interpolate_sam.pl',
    'maq2sam-long',
    'maq2sam-short',
    'md5fa',
    'md5sum-lite',
    'novo2sam.pl',
    'plot-ampliconstats',
    'plot-bamstats',
    'psl2sam.pl',
    'sam2vcf.pl',
    'samtools',
    'samtools.pl',
    'seq_cache_populate.pl',
    'soap2sam.pl',
    'wgsim',
    'wgsim_eval.pl',
    'zoom2sam.pl',
  ],
  dependencies: {
    'htslib.org': '*',
    'invisible-island.net/ncurses': '*',
    'zlib.net': '1',
  },
  distributable: {
    url: 'https://github.com/samtools/samtools/releases/download/{{version.raw}}/samtools-{{version.raw}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--with-htslib={{deps.htslib.org.prefix}}',
      ],
      linux: {
        LDFLAGS: '$LDFLAGS -Wl,-ltinfo',
      },
    },
  },
  test: {
    script: [
      'samtools faidx test.fasta',
      'test "$(cat test.fasta.fai)" = "U00096.2:1-70	70	15	70	71"',
    ],
  },
}
