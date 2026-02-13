/**
 * **flutter** - Flutter makes it easy and fast to build beautiful apps for mobile and beyond
 *
 * @domain `flutter.dev`
 * @programs `flutter`, `dart`
 * @version `3.38.7` (68 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install flutter.dev`
 * @homepage https://flutter.dev
 * @dependencies `git-scm.org`, `tukaani.org/xz`, `gnu.org/which`, ... (+3 more) (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.flutterdev
 * console.log(pkg.name)        // "flutter"
 * console.log(pkg.description) // "Flutter makes it easy and fast to build beautif..."
 * console.log(pkg.programs)    // ["flutter", "dart"]
 * console.log(pkg.versions[0]) // "3.38.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/flutter-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const flutterdevPackage = {
  /**
   * The display name of this package.
   */
  name: 'flutter' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'flutter.dev' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Flutter makes it easy and fast to build beautiful apps for mobile and beyond' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/flutter.dev/package.yml' as const,
  homepageUrl: 'https://flutter.dev' as const,
  githubUrl: 'https://github.com/flutter/flutter' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install flutter.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +flutter.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install flutter.dev' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'flutter',
    'dart',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'git-scm.org',
    'tukaani.org/xz',
    'gnu.org/which',
    'linux:curl.se',
    'linux:info-zip.org/zip',
    'linux:info-zip.org/unzip',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.38.7',
    '3.38.6',
    '3.38.5',
    '3.38.4',
    '3.38.3',
    '3.38.2',
    '3.38.1',
    '3.38.0',
    '3.35.7',
    '3.35.6',
    '3.35.5',
    '3.35.4',
    '3.35.3',
    '3.35.2',
    '3.35.1',
    '3.35.0',
    '3.32.8',
    '3.32.7',
    '3.32.6',
    '3.32.5',
    '3.32.4',
    '3.32.3',
    '3.32.2',
    '3.32.1',
    '3.32.0',
    '3.29.3',
    '3.29.2',
    '3.29.1',
    '3.29.0',
    '3.27.4',
    '3.27.3',
    '3.27.2',
    '3.27.1',
    '3.27.0',
    '3.24.5',
    '3.24.4',
    '3.24.3',
    '3.24.2',
    '3.24.1',
    '3.24.0',
    '3.22.3',
    '3.22.2',
    '3.22.1',
    '3.22.0',
    '3.19.6',
    '3.19.5',
    '3.19.4',
    '3.19.3',
    '3.19.2',
    '3.19.1',
    '3.19.0',
    '3.16.9',
    '3.16.8',
    '3.16.7',
    '3.16.6',
    '3.16.5',
    '3.16.4',
    '3.16.3',
    '3.16.2',
    '3.16.1',
    '3.16.0',
    '3.13.9',
    '3.13.8',
    '3.13.7',
    '3.13.6',
    '3.13.5',
    '3.13.4',
    '3.13.3',
  ] as const,
  aliases: [] as const,
}

export type FlutterdevPackage = typeof flutterdevPackage
