/**
 * **ruby-build** - A tool to download, compile, and install Ruby on Unix-like systems.
 *
 * @domain `rbenv.org/ruby-build`
 * @programs `ruby-build`
 * @version `20260121.0.0` (63 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rbenv.org/ruby-build`
 * @homepage https://rbenv.org/man/ruby-build.1
 * @dependencies `openssl.org>=1.1`, `curl.se`, `gnu.org/autoconf^2.72`, ... (+3 more)
 * @buildDependencies `linux:gnu.org/gcc@<15` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rbenvorgrubybuild
 * console.log(pkg.name)        // "ruby-build"
 * console.log(pkg.description) // "A tool to download, compile, and install Ruby o..."
 * console.log(pkg.programs)    // ["ruby-build"]
 * console.log(pkg.versions[0]) // "20260121.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rbenv-org/ruby-build.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rbenvorgrubybuildPackage = {
  /**
   * The display name of this package.
   */
  name: 'ruby-build' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'rbenv.org/ruby-build' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A tool to download, compile, and install Ruby on Unix-like systems.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rbenv.org/ruby-build/package.yml' as const,
  homepageUrl: 'https://rbenv.org/man/ruby-build.1' as const,
  githubUrl: 'https://github.com/rbenv/ruby-build' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install rbenv.org/ruby-build' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rbenv.org/ruby-build -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rbenv.org/ruby-build' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ruby-build',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org>=1.1',
    'curl.se',
    'gnu.org/autoconf^2.72',
    'freedesktop.org/pkg-config',
    'gnu.org/readline^8.2',
    'pyyaml.org/libyaml^0.2',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'linux:gnu.org/gcc@<15',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '20260121.0.0',
    '20260114.0.0',
    '20260113.0.0',
    '20260110.0.0',
    '20251225.0.0',
    '20251218.0.0',
    '20251217.0.0',
    '20251203.0.0',
    '20251117.0.0',
    '20251023.0.0',
    '20251008.0.0',
    '20250925.0.0',
    '20250916.1.0',
    '20250916.0.0',
    '20250908.0.0',
    '20250829.0.0',
    '20250811.0.0',
    '20250724.0.0',
    '20250716.0.0',
    '20250610.0.0',
    '20250529.1.0',
    '20250516.0.0',
    '20250507.0.0',
    '20250430.0.0',
    '20250424.0.0',
    '20250418.0.0',
    '20250415.0.0',
    '20250409.0.0',
    '20250326.0.0',
    '20250318.0.0',
    '20250215.0.0',
    '20250212.0.0',
    '20250205.0.0',
    '20250130.0.0',
    '20250127.0.0',
    '20250121.0.0',
    '20250115.0.0',
    '20250114.0.0',
    '20241225.2.0',
    '20241225.1.0',
    '20241225.0.0',
    '20241213.0.0',
    '20241105.0.0',
    '20241030.0.0',
    '20241017.0.0',
    '20241007.0.0',
    '20240917.0.0',
    '20240903.0.0',
    '20240727.0.0',
    '20240722.0.0',
    '20240709.1.0',
    '20240709.0.0',
    '20240702.0.0',
    '20240612.0.0',
    '20240530.1.0',
    '20240530.0.0',
    '20240517.0.0',
    '20240501.0.0',
    '20240423.0.0',
    '20240416.0.0',
    '20240319.0.0',
    '20240318.0.0',
    '20240221.0.0',
  ] as const,
  aliases: [] as const,
}

export type RbenvorgrubybuildPackage = typeof rbenvorgrubybuildPackage
