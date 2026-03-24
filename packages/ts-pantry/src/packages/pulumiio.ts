/**
 * **pulumi** - Pulumi - Infrastructure as Code in any programming language 🚀
 *
 * @domain `pulumi.io`
 * @programs `pulumi`, `pulumi-analyzer-policy`, `pulumi-analyzer-policy-python`, `pulumi-language-dotnet`, `pulumi-language-go`, ... (+8 more)
 * @version `3.227.0` (192 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install pulumi.io`
 * @homepage https://pulumi.io/
 * @dependencies `curl.se/ca-certs`
 * @buildDependencies `go.dev@^1.20`, `classic.yarnpkg.com`, `nodejs.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.pulumiio
 * console.log(pkg.name)        // "pulumi"
 * console.log(pkg.description) // "Pulumi - Infrastructure as Code in any programm..."
 * console.log(pkg.programs)    // ["pulumi", "pulumi-analyzer-policy", ...]
 * console.log(pkg.versions[0]) // "3.227.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/pulumi-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const pulumiioPackage = {
  /**
  * The display name of this package.
  */
  name: 'pulumi' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'pulumi.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Pulumi - Infrastructure as Code in any programming language 🚀' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pulumi.io/package.yml' as const,
  homepageUrl: 'https://pulumi.io/' as const,
  githubUrl: 'https://github.com/pulumi/pulumi' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install pulumi.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pulumi.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install pulumi.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pulumi',
    'pulumi-analyzer-policy',
    'pulumi-analyzer-policy-python',
    'pulumi-language-dotnet',
    'pulumi-language-go',
    'pulumi-language-java',
    'pulumi-language-nodejs',
    'pulumi-language-python',
    'pulumi-language-python-exec',
    'pulumi-language-yaml',
    'pulumi-resource-pulumi-nodejs',
    'pulumi-resource-pulumi-python',
    'pulumi-watch',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'curl.se/ca-certs',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.20',
    'classic.yarnpkg.com',
    'nodejs.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.227.0',
    '3.226.0',
    '3.225.1',
    '3.225.0',
    '3.224.0',
    '3.223.0',
    '3.222.0',
    '3.221.0',
    '3.220.0',
    '3.219.0',
    '3.218.0',
    '3.217.1',
    '3.217.0',
    '3.216.0',
    '3.215.0',
    '3.214.1',
    '3.214.0',
    '3.213.0',
    '3.212.0',
    '3.211.0',
    '3.210.0',
    '3.209.0',
    '3.208.0',
    '3.207.0',
    '3.206.0',
    '3.205.0',
    '3.204.0',
    '3.203.0',
    '3.202.0',
    '3.201.0',
    '3.200.0',
    '3.199.0',
    '3.198.0',
    '3.197.0',
    '3.196.0',
    '3.195.0',
    '3.194.0',
    '3.193.0',
    '3.192.0',
    '3.191.0',
    '3.190.0',
    '3.189.0',
    '3.188.0',
    '3.187.0',
    '3.186.0',
    '3.185.0',
    '3.184.0',
    '3.183.0',
    '3.182.0',
    '3.181.0',
  ] as const,
  aliases: [] as const,
}

export type PulumiioPackage = typeof pulumiioPackage
