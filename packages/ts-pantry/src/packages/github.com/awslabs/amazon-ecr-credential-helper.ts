/**
 * **docker-credential-ecr-login** - Automatically gets credentials for Amazon ECR on docker push/docker pull
 *
 * @domain `github.com/awslabs/amazon-ecr-credential-helper`
 * @programs `docker-credential-ecr-login`
 * @version `0.12.0` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/awslabs/amazon-ecr-credential-helper`
 * @buildDependencies `gnu.org/bash`, `gnu.org/make`, `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomawslabsamazonecrcredentialhelper
 * console.log(pkg.name)        // "docker-credential-ecr-login"
 * console.log(pkg.description) // "Automatically gets credentials for Amazon ECR o..."
 * console.log(pkg.programs)    // ["docker-credential-ecr-login"]
 * console.log(pkg.versions[0]) // "0.12.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/awslabs/amazon-ecr-credential-helper.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const amazonecrcredentialhelperPackage = {
  /**
  * The display name of this package.
  */
  name: 'docker-credential-ecr-login' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/awslabs/amazon-ecr-credential-helper' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Automatically gets credentials for Amazon ECR on docker push/docker pull' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/awslabs/amazon-ecr-credential-helper/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/awslabs/amazon-ecr-credential-helper' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/awslabs/amazon-ecr-credential-helper' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/awslabs/amazon-ecr-credential-helper -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/awslabs/amazon-ecr-credential-helper' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'docker-credential-ecr-login',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/bash',
    'gnu.org/make',
    'go.dev@^1.21',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.12.0',
    '0.11.0',
    '0.10.1',
    '0.10.0',
    '0.9.1',
    '0.9.0',
    '0.8.0',
    '0.7.1',
  ] as const,
  aliases: [] as const,
}

export type AmazonecrcredentialhelperPackage = typeof amazonecrcredentialhelperPackage
