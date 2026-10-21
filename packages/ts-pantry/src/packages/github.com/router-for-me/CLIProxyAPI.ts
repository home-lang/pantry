/**
 * **CLIProxyAPI** - CLI Proxy API — OpenAI/Gemini/Claude/Codex-compatible API for CLI subscriptions
 *
 * @domain `github.com/router-for-me/CLIProxyAPI`
 * @programs `cli-proxy-api`
 * @version `8.0.38` (187 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/router-for-me/CLIProxyAPI`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.cliproxyapi
 * console.log(pkg.name)        // "CLIProxyAPI"
 * console.log(pkg.programs)    // ["cli-proxy-api"]
 * console.log(pkg.versions[0]) // "8.0.38" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/router-for-me/CLIProxyAPI.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const cliproxyapiPackage = {
  /**
  * The display name of this package.
  */
  name: 'CLIProxyAPI' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/router-for-me/CLIProxyAPI' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'CLI Proxy API — use your Gemini CLI, Claude Code, Codex, Kimi, Qwen, iFlow and Grok CLI subscriptions through OpenAI/Gemini/Claude/Codex-compatible API endpoints.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://help.router-for.me/' as const,
  githubUrl: 'https://github.com/router-for-me/CLIProxyAPI' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/router-for-me/CLIProxyAPI' as const,
  pantryInstallCommand: 'pantry install github.com/router-for-me/CLIProxyAPI' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cli-proxy-api',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '8.0.38',
    '8.0.37',
    '8.0.36',
    '8.0.35',
    '8.0.34',
    '8.0.33',
    '8.0.32',
    '8.0.31',
    '8.0.30',
    '8.0.29',
    '8.0.28',
    '8.0.27',
    '8.0.26',
    '8.0.25',
    '8.0.24',
    '8.0.23',
    '8.0.22',
    '8.0.21',
    '8.0.20',
    '8.0.19',
    '8.0.18',
    '8.0.17',
    '8.0.16',
    '8.0.15',
    '8.0.14',
    '8.0.13',
    '8.0.12',
    '8.0.11',
    '8.0.10',
    '8.0.9',
    '8.0.8',
    '8.0.7',
    '8.0.6',
    '8.0.5',
    '8.0.4',
    '8.0.3',
    '8.0.2',
    '8.0.1',
    '8.0.0',
    '7.3.20',
    '7.3.19',
    '7.3.18',
    '7.3.17',
    '7.3.16',
    '7.3.15',
    '7.3.14',
    '7.3.13',
    '7.3.12',
    '7.3.11',
    '7.3.10',
    '7.3.9',
    '7.3.8',
    '7.3.7',
    '7.3.6',
    '7.3.5',
    '7.3.4',
    '7.3.3',
    '7.3.2',
    '7.3.1',
    '7.3.0',
    '7.2.159',
    '7.2.158',
    '7.2.157',
    '7.2.156',
    '7.2.155',
    '7.2.154',
    '7.2.153',
    '7.2.152',
    '7.2.151',
    '7.2.150',
    '7.2.149',
    '7.2.148',
    '7.2.147',
    '7.2.146',
    '7.2.145',
    '7.2.144',
    '7.2.143',
    '7.2.142',
    '7.2.141',
    '7.2.140',
    '7.2.139',
    '7.2.138',
    '7.2.137',
    '7.2.136',
    '7.2.135',
    '7.2.134',
    '7.2.133',
    '7.2.132',
    '7.2.131',
    '7.2.130',
    '7.2.129',
    '7.2.128',
    '7.2.127',
    '7.2.126',
    '7.2.125',
    '7.2.124',
    '7.2.123',
    '7.2.122',
    '7.2.121',
    '7.2.120',
    '7.2.119',
    '7.2.118',
    '7.2.117',
    '7.2.116',
    '7.2.115',
    '7.2.114',
    '7.2.113',
    '7.2.112',
    '7.2.111',
    '7.2.110',
    '7.2.109',
    '7.2.108',
    '7.2.107',
    '7.2.106',
    '7.2.105',
    '7.2.104',
    '7.2.103',
    '7.2.102',
    '7.2.101',
    '7.2.100',
    '7.2.99',
    '7.2.98',
    '7.2.97',
    '7.2.96',
    '7.2.95',
    '7.2.94',
    '7.2.93',
    '7.2.92',
    '7.2.91',
    '7.2.90',
    '7.2.89',
    '7.2.88',
    '7.2.87',
    '7.2.86',
    '7.2.85',
    '7.2.84',
    '7.2.83',
    '7.2.82',
    '7.2.81',
    '7.2.80',
    '7.2.79',
    '7.2.78',
    '7.2.77',
    '7.2.76',
    '7.2.75',
    '7.2.74',
    '7.2.73',
    '7.2.72',
    '7.2.71',
    '7.2.70',
    '7.2.69',
    '7.2.68',
    '7.2.67',
    '7.2.66',
    '7.2.65',
    '7.2.64',
    '7.2.63',
    '7.2.62',
    '7.2.61',
    '7.2.60',
    '7.2.59',
    '7.2.58',
    '7.2.57',
    '7.2.56',
    '7.2.55',
    '7.2.54',
    '7.2.53',
    '7.2.52',
    '7.2.51',
    '7.2.50',
    '7.2.49',
    '7.2.48',
    '7.2.47',
    '7.2.46',
    '7.2.45',
    '7.2.44',
    '7.2.43',
    '7.2.42',
    '7.2.41',
    '7.2.40',
    '7.2.39',
    '7.2.38',
    '7.2.37',
    '7.2.36',
    '7.2.35',
    '7.2.34',
    '7.2.33',
  ] as const,
  aliases: [] as const,
}

export type CliproxyapiPackage = typeof cliproxyapiPackage
