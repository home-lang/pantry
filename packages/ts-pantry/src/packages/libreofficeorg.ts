/**
 * **LibreOffice** - A free and powerful office suite.
 *
 * @domain `libreoffice.org`
 * @programs `libreoffice`
 * @version `24.8.5` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install libreoffice.org`
 * @homepage https://libreoffice.org
 */
export const libreofficeorgPackage = {
  name: 'LibreOffice' as const,
  domain: 'libreoffice.org' as const,
  description: 'A free and powerful office suite.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://libreoffice.org' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install libreoffice.org' as const,
  programs: ['libreoffice'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['24.8.5', '24.8.4'] as const,
  aliases: ['libreoffice', 'soffice'] as const,
}
export type LibreofficeorgPackage = typeof libreofficeorgPackage
