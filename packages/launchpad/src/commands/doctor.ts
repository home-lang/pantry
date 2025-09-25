import type { Command } from '../cli/types'
import { formatDoctorReport, runDoctorChecks } from '../doctor'

const command: Command = {
  name: 'doctor',
  description: 'Run health checks and report issues with your Launchpad setup',
  async run() {
    try {
      const report = await runDoctorChecks()
      // eslint-disable-next-line no-console
      console.log(formatDoctorReport(report))
      return report.overall === 'healthy' ? 0 : 1
    }
    catch (err) {
      console.error(`Failed to run doctor: ${err instanceof Error ? err.message : String(err)}`)
      return 1
    }
  },
}

export default command
