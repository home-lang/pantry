import type { Command } from '../../cli/types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const command: Command = {
  name: 'db:create',
  description: 'Create a database for the current project',
  async run({ options }) {
    const { createProjectDatabase, generateLaravelConfig } = await import('../../services/database')
    const typeRaw = options?.type as string | undefined
    const type = (typeRaw && ['postgres', 'mysql', 'sqlite', 'auto'].includes(typeRaw)) ? typeRaw as 'postgres' | 'mysql' | 'sqlite' | 'auto' : undefined
    const port = typeof options?.port === 'string' ? Number.parseInt(options.port, 10) : (typeof options?.port === 'number' ? options.port : undefined)
    const name = typeof options?.name === 'string' ? options.name : undefined
    const host = typeof options?.host === 'string' ? options.host : undefined
    const user = typeof options?.user === 'string' ? options.user : undefined
    const password = typeof options?.password === 'string' ? options.password : undefined

    const dbName = name || path.basename(process.cwd()).replace(/\W/g, '_')

    const dbOptions = {
      host,
      port,
      user,
      password,
      type: type === 'auto' ? undefined : (type as any),
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
