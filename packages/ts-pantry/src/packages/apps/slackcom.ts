/**
 * **Slack** - A messaging and collaboration platform for teams.
 *
 * @domain `slack.com`
 * @programs `slack`
 * @version `4.52.182` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install slack.com`
 * @homepage https://slack.com
 */
export const slackcomPackage = {
  name: 'Slack' as const,
  domain: 'slack.com' as const,
  description: 'A messaging and collaboration platform for teams.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://slack.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install slack.com' as const,
  programs: ['slack'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: [
    '4.52.182',
    '4.52.178',
    '4.52.171',
    '4.52.162',
    '4.52.155',
    '4.51.191',
    '4.51.185',
    '4.51.180',
    '4.50.143',
    '4.41.105',
    '4.41.104',
    '4.41.103',
  ] as const,
  aliases: ['slack'] as const,
}
export type SlackcomPackage = typeof slackcomPackage
