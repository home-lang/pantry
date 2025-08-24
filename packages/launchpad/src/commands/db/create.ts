import type { Command } from '../../cli/types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

function parseArgs(argv: string[]): {
  name?: string
  type?: 'postgres' | 'mysql' | 'sqlite' | 'auto'
  host?: string
  port?: number
  user?: string
  password?: string
} {
  const opts: any = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--name' && i + 1 < argv.length) {
      opts.name = String(argv[++i])
    }
    else if (a === '--type' && i + 1 < argv.length) {
      const v = String(argv[++i]) as any
      if (['postgres', 'mysql', 'sqlite', 'auto'].includes(v))
        opts.type = v
    }
    else if (a === '--host' && i + 1 < argv.length) {
      opts.host = String(argv[++i])
    }
    else if (a === '--port' && i + 1 < argv.length) {
      const v = Number.parseInt(argv[++i], 10)
      if (!Number.isNaN(v))
        opts.port = v
    }
    else if (a === '--user' && i + 1 < argv.length) {
      opts.user = String(argv[++i])
    }
    else if (a === '--password' && i + 1 < argv.length) {
      opts.password = String(argv[++i])
    }
  }
  return opts
}

const command: Command = {
  name: 'db:create',
  description: 'Create a database for the current project',
  async run({ argv }) {
    const { createProjectDatabase, generateLaravelConfig } = await import('../../services/database')
    const opts = parseArgs(argv)

    const dbName = opts.name || path.basename(process.cwd()).replace(/\W/g, '_')

    const dbOptions = {
      host: opts.host,
      port: opts.port,
      user: opts.user,
      password: opts.password,
      type: opts.type === 'auto' ? undefined : (opts.type as any),
    }

    const connectionInfo = await createProjectDatabase(dbName, dbOptions)

    console.warn('\n📋 Database Connection Details:')
    console.warn(`   Type: ${connectionInfo.type}`)
    if (connectionInfo.host)
      console.warn(`   Host: ${connectionInfo.host}`)
    if (connectionInfo.port)
      console.warn(`   Port: ${connectionInfo.port}`)
    console.warn(`   Database: ${connectionInfo.database}`)
    if (connectionInfo.username)
      console.warn(`   Username: ${connectionInfo.username}`)
    if (connectionInfo.path)
      console.warn(`   Path: ${connectionInfo.path}`)

    // Generate Laravel .env configuration
    const envConfig = generateLaravelConfig(connectionInfo)
    console.warn('\n🔧 Laravel .env configuration:')
    console.warn(envConfig)

    // Check if this is a Laravel project and offer to update .env
    if (fs.existsSync('artisan') && fs.existsSync('.env')) {
      console.warn('\n💡 Laravel project detected! You can update your .env file with the configuration above.')
    }

    return 0
  },
}

export default command
