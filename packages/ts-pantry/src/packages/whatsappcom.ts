/**
 * **WhatsApp** - A messaging app for simple, reliable, and private communication.
 *
 * @domain `whatsapp.com`
 * @programs `whatsapp`
 * @version `2.24.25.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install whatsapp.com`
 * @homepage https://whatsapp.com
 */
export const whatsappcomPackage = {
  name: 'WhatsApp' as const,
  domain: 'whatsapp.com' as const,
  description: 'A messaging app for simple, reliable, and private communication.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://whatsapp.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install whatsapp.com' as const,
  programs: ['whatsapp'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['2.24.25.0', '2.24.24.0'] as const,
  aliases: ['whatsapp'] as const,
}
export type WhatsappcomPackage = typeof whatsappcomPackage
