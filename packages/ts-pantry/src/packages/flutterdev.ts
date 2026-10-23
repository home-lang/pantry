/**
 * **flutter** - Flutter makes it easy and fast to build beautiful apps for mobile and beyond
 *
 * @domain `flutter.dev`
 * @programs `flutter`, `dart`
 * @version `3.47.8` (181 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install flutter.dev`
 * @homepage https://flutter.dev
 * @dependencies `git-scm.org`, `tukaani.org/xz`, `gnu.org/which`, ... (+3 more) (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.flutterdev
 * console.log(pkg.name)        // "flutter"
 * console.log(pkg.description) // "Flutter makes it easy and fast to build beautif..."
 * console.log(pkg.programs)    // ["flutter", "dart"]
 * console.log(pkg.versions[0]) // "3.47.8" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/flutter-dev.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install flutter.dev' as const,
  pantryInstallCommand: 'pantry install flutter.dev' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.47.8',
    '3.47.7',
    '3.47.6',
    '3.47.5',
    '3.47.4',
    '3.47.3',
    '3.47.2',
    '3.47.1',
    '3.47.0',
    '3.44.9',
    '3.44.8',
    '3.44.7',
    '3.44.6',
    '3.44.5',
    '3.44.4',
    '3.44.3',
    '3.44.2',
    '3.44.1',
    '3.44.0',
    '3.41.9',
    '3.41.8',
    '3.41.7',
    '3.41.6',
    '3.41.5',
    '3.41.4',
    '3.41.3',
    '3.41.2',
    '3.41.1',
    '3.41.0',
    '3.38.10',
    '3.38.9',
    '3.38.8',
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
    '3.13.2',
    '3.13.1',
    '3.13.0',
    '3.10.6',
    '3.10.5',
    '3.10.4',
    '3.10.3',
    '3.10.2',
    '3.10.1',
    '3.10.0',
    '3.7.12',
    '3.7.11',
    '3.7.10',
    '3.7.9',
    '3.7.8',
    '3.7.7',
    '3.7.6',
    '3.7.5',
    '3.7.4',
    '3.7.3',
    '3.7.2',
    '3.7.1',
    '3.7.0',
    '3.3.10',
    '3.3.9',
    '3.3.8',
    '3.3.7',
    '3.3.6',
    '3.3.5',
    '3.3.4',
    '3.3.3',
    '3.3.2',
    '3.3.1',
    '3.3.0',
    '3.0.5',
    '3.0.4',
    '3.0.3',
    '3.0.2',
    '3.0.1',
    '3.0.0',
    '2.10.5',
    '2.10.4',
    '2.10.3',
    '2.10.2',
    '2.10.1',
    '2.10.0',
    '2.8.1',
    '2.8.0',
    '2.5.3',
    '2.5.2',
    '2.5.1',
    '2.5.0',
    '2.2.3',
    '2.2.2',
    '2.2.1',
    '2.2.0',
    '2.0.6',
    '2.0.5',
    '2.0.4',
    '2.0.3',
    '2.0.2',
    '2.0.1',
    '2.0.0',
    '1.22.6',
    '1.22.5',
    '1.22.4',
    '1.22.3',
    '1.22.2',
    '1.22.1',
    '1.22.0',
    '1.20.4',
    '1.20.3',
    '1.20.2',
    '1.20.1',
    '1.20.0',
    '1.17.5',
    '1.17.4',
    '1.17.3',
    '1.17.2',
    '1.17.1',
    '1.17.0',
  ] as const,
  aliases: [] as const,
}

export type FlutterdevPackage = typeof flutterdevPackage
