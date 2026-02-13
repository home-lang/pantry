/**
 * **coreutils** - pkgx package
 *
 * @domain `gnu.org/coreutils`
 * @programs `[`, `b2sum`, `base32`, `base64`, `basename`, ... (+100 more)
 * @version `9.9.0` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/coreutils`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgcoreutils
 * console.log(pkg.name)        // "coreutils"
 * console.log(pkg.programs)    // ["[", "b2sum", ...]
 * console.log(pkg.versions[0]) // "9.9.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/coreutils.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgcoreutilsPackage = {
  /**
   * The display name of this package.
   */
  name: 'coreutils' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/coreutils' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/coreutils/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/coreutils' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/coreutils -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/coreutils' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    '[',
    'b2sum',
    'base32',
    'base64',
    'basename',
    'basenc',
    'cat',
    'chcon',
    'chgrp',
    'chmod',
    'chown',
    'chroot',
    'cksum',
    'comm',
    'cp',
    'csplit',
    'cut',
    'date',
    'dd',
    'df',
    'dir',
    'dircolors',
    'dirname',
    'du',
    'echo',
    'env',
    'expand',
    'expr',
    'factor',
    'false',
    'fmt',
    'fold',
    'groups',
    'head',
    'hostid',
    'id',
    'install',
    'join',
    'kill',
    'link',
    'ln',
    'logname',
    'ls',
    'md5sum',
    'mkdir',
    'mkfifo',
    'mknod',
    'mktemp',
    'mv',
    'nice',
    'nl',
    'nohup',
    'nproc',
    'numfmt',
    'od',
    'paste',
    'pathchk',
    'pinky',
    'pr',
    'printenv',
    'printf',
    'ptx',
    'pwd',
    'readlink',
    'realpath',
    'rm',
    'rmdir',
    'runcon',
    'seq',
    'sha1sum',
    'sha224sum',
    'sha256sum',
    'sha384sum',
    'sha512sum',
    'shred',
    'shuf',
    'sleep',
    'sort',
    'split',
    'stat',
    'stty',
    'sum',
    'sync',
    'tac',
    'tail',
    'tee',
    'test',
    'timeout',
    'touch',
    'tr',
    'true',
    'truncate',
    'tsort',
    'tty',
    'uname',
    'unexpand',
    'uniq',
    'unlink',
    'uptime',
    'users',
    'vdir',
    'wc',
    'who',
    'whoami',
    'yes',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '9.9.0',
    '9.8.0',
    '9.7.0',
    '9.6.0',
    '9.5.0',
    '9.4.0',
    '9.1.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorgcoreutilsPackage = typeof gnuorgcoreutilsPackage
