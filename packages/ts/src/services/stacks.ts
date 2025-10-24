import { createProjectDatabase } from './database'

export async function createDevelopmentStack(name: string, type: string, database: string): Promise<void> {
  console.warn(`🚀 Creating ${type.toUpperCase()} stack: ${name}`)
  console.warn(`📦 Database: ${database}`)

  // Create database
  await createProjectDatabase(name, { type: database as any })

  // Start required services based on stack type
  switch (type) {
    case 'laravel':
      console.warn('🐘 Laravel stack requires PHP and database')
      break
    case 'lamp':
      console.warn('🔥 LAMP stack: Linux, Apache, MySQL, PHP')
      break
    case 'lemp':
      console.warn('⚡ LEMP stack: Linux, Nginx, MySQL, PHP')
      break
    default:
      console.warn(`Stack type ${type} is not yet implemented`)
  }

  console.warn('✅ Development stack created!')
}
