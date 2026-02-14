/**
 * **yarn** - 📦🐈 Active development trunk for Yarn ⚒
 *
 * @domain `yarnpkg.com`
 * @programs `yarn`, `yarnpkg`
 * @version `4.12.0` (48 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install yarnpkg.com`
 * @homepage https://yarnpkg.com/
 * @dependencies `nodejs.org`
 * @buildDependencies `classic.yarnpkg.com@^1`, `nodejs.org@>=18.3<23` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.yarnpkgcom
 * console.log(pkg.name)        // "yarn"
 * console.log(pkg.description) // "📦🐈 Active development trunk for Yarn ⚒"
 * console.log(pkg.programs)    // ["yarn", "yarnpkg"]
 * console.log(pkg.versions[0]) // "4.12.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/yarnpkg-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const yarnPackage = {
  /**
  * The display name of this package.
  */
  name: 'yarn' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'yarnpkg.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: '📦🐈 Active development trunk for Yarn ⚒' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/yarnpkg.com/package.yml' as const,
  homepageUrl: 'https://yarnpkg.com/' as const,
  githubUrl: 'https://github.com/yarnpkg/berry' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install yarnpkg.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +yarnpkg.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install yarnpkg.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'yarn',
    'yarnpkg',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'nodejs.org',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'classic.yarnpkg.com@^1',
    'nodejs.org@>=18.3<23',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.12.0',
    '4.11.0',
    '4.10.3',
    '4.10.2',
    '4.10.1',
    '4.10.0',
    '4.9.4',
    '4.9.3',
    '4.9.2',
    '4.9.1',
    '4.9.0',
    '4.8.1',
    '4.8.0',
    '4.7.0',
    '4.6.0',
    '4.5.3',
    '4.5.2',
    '4.5.1',
    '4.5.0',
    '4.4.1',
    '4.4.0',
    '4.3.1',
    '4.3.0',
    '4.2.2',
    '4.2.1',
    '4.2.0',
    '4.1.1',
    '4.1.0',
    '4.0.2',
    '4.0.1',
    '4.0.0',
    '3.8.7',
    '3.8.6',
    '3.8.5',
    '3.8.4',
    '3.8.3',
    '3.8.2',
    '3.8.1',
    '3.8.0',
    '3.7.0',
    '3.6.4',
    '3.6.3',
    '3.6.2',
    '3.6.1',
    '3.6.0',
    '3.5.1',
    '3.5.0',
    '3.4.1',
  ] as const,
  aliases: [] as const,
}

export type YarnPackage = typeof yarnPackage
