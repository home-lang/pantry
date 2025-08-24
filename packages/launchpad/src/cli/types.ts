export interface CommandContext {
  argv: string[]
  env: NodeJS.ProcessEnv
}

export interface Command {
  name: string
  aliases?: string[]
  description?: string
  help?: string
  run(ctx: CommandContext): Promise<number> | number
}

export type CommandModule = { default: Command }
