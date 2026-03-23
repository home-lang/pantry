/**
 * **Docker Desktop** - A desktop application for building and sharing containerized applications.
 *
 * @domain `docker.com/desktop`
 * @programs `docker-desktop`
 * @version `4.37.2` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install docker.com/desktop`
 * @homepage https://docker.com
 */
export const dockercomdesktopPackage = {
  name: 'Docker Desktop' as const,
  domain: 'docker.com/desktop' as const,
  description: 'A desktop application for building and sharing containerized applications.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://docker.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install docker.com/desktop' as const,
  programs: ['docker-desktop'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['4.37.2', '4.37.1', '4.37.0'] as const,
  aliases: ['docker-desktop'] as const,
}
export type DockercomdesktopPackage = typeof dockercomdesktopPackage
