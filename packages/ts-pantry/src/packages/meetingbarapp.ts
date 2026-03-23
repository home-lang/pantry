/**
 * **MeetingBar** - A menu bar app for your calendar meetings.
 *
 * @domain `meetingbar.app`
 * @programs `meetingbar`
 * @version `4.10.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install meetingbar.app`
 * @homepage https://meetingbar.app
 */
export const meetingbarappPackage = {
  name: 'MeetingBar' as const,
  domain: 'meetingbar.app' as const,
  description: 'A menu bar app for your calendar meetings.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://meetingbar.app' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install meetingbar.app' as const,
  programs: ['meetingbar'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['4.10.0', '4.9.0'] as const,
  aliases: ['meetingbar'] as const,
}
export type MeetingbarappPackage = typeof meetingbarappPackage
