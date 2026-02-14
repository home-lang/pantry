/**
 * **hurl** - Run and Test HTTP Requests with plain text and curl
 *
 * @domain `hurl.dev`
 * @programs `hurl`, `hurlfmt`
 * @version `7.1.0` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install hurl.dev`
 * @homepage https://hurl.dev
 * @dependencies `gnome.org/libxml2~2.13 # 2.14 changed the API`, `curl.se`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.hurldev
 * console.log(pkg.name)        // "hurl"
 * console.log(pkg.description) // "Run and Test HTTP Requests with plain text and ..."
 * console.log(pkg.programs)    // ["hurl", "hurlfmt"]
 * console.log(pkg.versions[0]) // "7.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/hurl-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const hurldevPackage = {
  /**
  * The display name of this package.
  */
  name: 'hurl' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'hurl.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Run and Test HTTP Requests with plain text and curl' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/hurl.dev/package.yml' as const,
  homepageUrl: 'https://hurl.dev' as const,
  githubUrl: 'https://github.com/Orange-OpenSource/hurl' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install hurl.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +hurl.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install hurl.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'hurl',
    'hurlfmt',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnome.org/libxml2~2.13 # 2.14 changed the API',
    'curl.se',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '7.1.0',
    '7.0.0',
    '6.1.1',
    '6.1.0',
    '6.0.0',
    '5.0.1',
    '5.0.0',
    '4.3.0',
    '4.2.0',
    '4.1.0',
    '4.0.0',
  ] as const,
  aliases: [] as const,
}

export type HurldevPackage = typeof hurldevPackage
