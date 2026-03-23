/**
 * **Postman** - An API platform for building and testing APIs.
 *
 * @domain `postman.com`
 * @programs `postman`
 * @version `11.27.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install postman.com`
 * @homepage https://postman.com
 */
export const postmancomPackage = {
  name: 'Postman' as const,
  domain: 'postman.com' as const,
  description: 'An API platform for building and testing APIs.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://postman.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install postman.com' as const,
  programs: ['postman'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['11.27.0', '11.26.0', '11.25.0'] as const,
  aliases: ['postman'] as const,
}
export type PostmancomPackage = typeof postmancomPackage
