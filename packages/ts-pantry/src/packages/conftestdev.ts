/**
 * **conftest** - Write tests against structured configuration data using the Open Policy Agent Rego query language
 *
 * @domain `conftest.dev`
 * @programs `conftest`
 * @version `0.67.0` (25 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install conftest.dev`
 * @homepage https://www.conftest.dev/
 * @buildDependencies `go.dev@~1.25.3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.conftestdev
 * console.log(pkg.name)        // "conftest"
 * console.log(pkg.description) // "Write tests against structured configuration da..."
 * console.log(pkg.programs)    // ["conftest"]
 * console.log(pkg.versions[0]) // "0.67.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/conftest-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const conftestdevPackage = {
  /**
  * The display name of this package.
  */
  name: 'conftest' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'conftest.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Write tests against structured configuration data using the Open Policy Agent Rego query language' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/conftest.dev/package.yml' as const,
  homepageUrl: 'https://www.conftest.dev/' as const,
  githubUrl: 'https://github.com/open-policy-agent/conftest' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install conftest.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +conftest.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install conftest.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'conftest',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.25.3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.68.2',
    '0.68.1',
    '0.68.0',
    '0.67.1',
    '0.67.0',
    '0.66.0',
    '0.65.0',
    '0.64.0',
    '0.63.0',
    '0.62.0',
    '0.61.2',
    '0.61.1',
    '0.61.0',
    '0.60.0',
    '0.59.0',
    '0.58.0',
    '0.57.0',
    '0.56.0',
    '0.55.0',
    '0.54.0',
    '0.53.0',
    '0.52.0',
    '0.51.0',
    '0.50.0',
    '0.49.1',
    '0.49.0',
    '0.48.0',
    '0.47.0',
    '0.46.0',
    '0.45.0',
    '0.44.1',
    '0.44.0',
    '0.43.1',
    '0.43.0',
    '0.42.1',
    '0.42.0',
    '0.41.0',
    '0.40.0',
    '0.39.2',
    '0.39.1',
    '0.39.0',
    '0.38.0',
    '0.37.0',
    '0.36.0',
    '0.35.0',
    '0.34.0',
    '0.33.2',
    '0.33.1',
    '0.33.0',
    '0.32.1',
    '0.32.0',
    '0.31.0',
    '0.30.1',
  ] as const,
  aliases: [] as const,
}

export type ConftestdevPackage = typeof conftestdevPackage
