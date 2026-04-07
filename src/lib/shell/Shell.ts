import type { CommandResult, ShellContext } from '@/types'
import { parseCommand } from './parser'
import { createFS, destroyFS, resolvePath } from './filesystem'
import { executeCommand } from './commands'

export class Shell {
  private fs: any
  private namespace: string
  cwd: string = '/'
  private _pendingMerge: { theirs: string } | null = null

  constructor(namespace: string) {
    this.namespace = namespace
    this.fs = createFS(namespace)
  }

  async init(): Promise<void> {
    try { await this.fs.promises.readdir('/') } catch { await this.fs.promises.mkdir('/') }
  }

  async reset(): Promise<void> {
    await destroyFS(this.namespace)
    this.fs = createFS(this.namespace)
    this.cwd = '/'
    this._pendingMerge = null
    await this.init()
  }

  get prompt(): string {
    const display = this.cwd === '/' ? '~' : '~' + this.cwd
    return `${display} $ `
  }

  async execute(input: string): Promise<CommandResult> {
    const parsed = parseCommand(input)
    if (!parsed) return { output: '' }

    // Handle echo with redirect at Shell level
    if (parsed.command === 'echo' && parsed.redirectOp && parsed.redirectTarget) {
      const text = parsed.args.join(' ')
      const filePath = resolvePath(this.cwd, parsed.redirectTarget)
      if (parsed.redirectOp === '>>') {
        try {
          const existing = await this.fs.promises.readFile(filePath, 'utf8')
          await this.fs.promises.writeFile(filePath, existing + text)
        } catch {
          await this.fs.promises.writeFile(filePath, text)
        }
      } else {
        await this.fs.promises.writeFile(filePath, text)
      }
      return { output: '' }
    }

    const ctx: ShellContext = {
      fs: this.fs, dir: '/', cwd: this.cwd,
      pendingMerge: this._pendingMerge,
      setPendingMerge: (m) => { this._pendingMerge = m },
    }

    const result = await executeCommand(parsed, ctx)
    if (result.cwd) { this.cwd = result.cwd }
    return result
  }

  getFS(): any { return this.fs }
}
