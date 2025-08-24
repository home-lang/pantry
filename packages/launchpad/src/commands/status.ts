import type { Command } from '../cli/types'
import { getServiceStatus, listServices, getAllServiceDefinitions } from '../services'

interface Options {
  format?: 'table' | 'json' | 'simple'
}

function parse(argv: string[]): { service?: string, opts: Options } {
  const args: string[] = []
  const opts: Options = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--format') {
      const val = argv[i + 1]
      if (val) {
        opts.format = val as any
        i++
      }
    }
    else if (!a.startsWith('--')) {
      args.push(a)
    }
  }
  return { service: args[0], opts }
}

const cmd: Command = {
  name: 'status',
  description: 'Show service status',
  async run({ argv }): Promise<number> {
    const { service, opts } = parse(argv)

    if (service) {
      const status = await getServiceStatus(service)
      const format = opts.format || 'simple'
      if (format === 'json') {
        console.log(JSON.stringify({ service, status }, null, 2))
      }
      else {
        const statusEmoji: Record<string, string> = {
          running: '🟢',
          stopped: '🔴',
          starting: '🟡',
          stopping: '🟡',
          failed: '🔴',
          unknown: '⚪',
        }
        console.log(`${statusEmoji[status]} ${service}: ${status}`)
      }
      return 0
    }

    const services = await listServices()
    const format = opts.format || 'table'

    if (format === 'json') {
      const result = services.map(service => ({
        name: service.definition?.name,
        displayName: service.definition?.displayName,
        status: service.status,
        enabled: service.enabled,
        pid: service.pid,
        startedAt: service.startedAt,
        port: service.definition?.port,
      }))
      console.log(JSON.stringify(result, null, 2))
      return 0
    }

    if (format === 'simple') {
      if (services.length === 0) {
        console.log('No services found')
        return 0
      }
      services.forEach((service) => {
        const statusEmoji: Record<string, string> = {
          running: '🟢',
          stopped: '🔴',
          starting: '🟡',
          stopping: '🟡',
          failed: '🔴',
          unknown: '⚪',
        }
        console.log(`${statusEmoji[service.status]} ${service.definition?.name}: ${service.status}`)
      })
      return 0
    }

    // table
    if (services.length === 0) {
      console.log('No services found')
      console.log('')
      console.log('Available services:')
      const definitions = getAllServiceDefinitions()
      definitions.forEach((def) => {
        console.log(`  ${def.name?.padEnd(12)} ${def.displayName}`)
      })
      return 0
    }

    console.log('Service Status:')
    console.log('')
    console.log(`${'Name'.padEnd(12) + 'Status'.padEnd(12) + 'Enabled'.padEnd(10) + 'PID'.padEnd(8) + 'Port'.padEnd(8)}Description`)
    console.log('─'.repeat(70))

    services.forEach((service) => {
      const statusEmoji: Record<string, string> = {
        running: '🟢',
        stopped: '🔴',
        starting: '🟡',
        stopping: '🟡',
        failed: '🔴',
        unknown: '⚪',
      }

      const name = service.definition?.name?.padEnd(12) || 'unknown'.padEnd(12)
      const status = `${statusEmoji[service.status]} ${service.status}`.padEnd(12)
      const enabled = (service.enabled ? '✅' : '❌').padEnd(10)
      const pid = (service.pid ? String(service.pid) : '-').padEnd(8)
      const port = (service.definition?.port ? String(service.definition.port) : '-').padEnd(8)
      const description = service.definition?.description || ''

      console.log(`${name}${status}${enabled}${pid}${port}${description}`)
    })

    return 0
  },
}

export default cmd
