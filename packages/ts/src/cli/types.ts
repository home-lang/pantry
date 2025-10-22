export interface CommandContext {
  // Backward-compat: most commands expect argv to exist
  argv: string[]
  // Preferred: structured options parsed by the CLI
  options?: Record<string, any>
  env: NodeJS.ProcessEnv
}

export interface Command {
  name: string
  aliases?: string[]
  description?: string
  help?: string
  run: (ctx: CommandContext) => Promise<number> | number
}

export interface CommandModule { default: Command }
