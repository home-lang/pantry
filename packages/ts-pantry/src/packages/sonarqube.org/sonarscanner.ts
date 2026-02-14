/**
 * **sonar-scanner** - Scanner CLI for SonarQube (Server, Cloud)
 *
 * @domain `sonarqube.org/sonarscanner`
 * @programs `sonar-scanner`, `sonar-scanner-debug`
 * @version `8.0.1.6346` (14 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sonarqube.org/sonarscanner`
 * @homepage http://redirect.sonarsource.com/doc/install-configure-scanner.html
 * @dependencies `openjdk.org^21`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sonarqubeorgsonarscanner
 * console.log(pkg.name)        // "sonar-scanner"
 * console.log(pkg.description) // "Scanner CLI for SonarQube (Server, Cloud)"
 * console.log(pkg.programs)    // ["sonar-scanner", "sonar-scanner-debug"]
 * console.log(pkg.versions[0]) // "8.0.1.6346" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sonarqube-org/sonarscanner.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sonarqubeorgsonarscannerPackage = {
  /**
  * The display name of this package.
  */
  name: 'sonar-scanner' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'sonarqube.org/sonarscanner' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Scanner CLI for SonarQube (Server, Cloud)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sonarqube.org/sonarscanner/package.yml' as const,
  homepageUrl: 'http://redirect.sonarsource.com/doc/install-configure-scanner.html' as const,
  githubUrl: 'https://github.com/SonarSource/sonar-scanner-cli' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install sonarqube.org/sonarscanner' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sonarqube.org/sonarscanner -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sonarqube.org/sonarscanner' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sonar-scanner',
    'sonar-scanner-debug',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openjdk.org^21',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '8.0.1.6346',
    '8.0.0.6341',
    '7.3.0.5189',
    '7.2.0.5079',
    '7.1.0.4889',
    '7.0.2.4839',
    '7.0.1.4817',
    '7.0.0.4796',
    '6.2.1.4610',
    '6.2.0.4584',
    '6.1.0.4477',
    '6.0.0.4432',
    '5.0.2.4997',
    '5.0.1.3006',
  ] as const,
  aliases: [] as const,
}

export type SonarqubeorgsonarscannerPackage = typeof sonarqubeorgsonarscannerPackage
