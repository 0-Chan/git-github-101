import { describe, it, expect, beforeEach } from 'vitest'
import { createFS } from '@/lib/shell/filesystem'
import { executeCommand } from '@/lib/shell/commands'
import type { ShellContext } from '@/types'

function makeContext(fs: any): ShellContext {
  return { fs, dir: '/', cwd: '/', pendingMerge: null, setPendingMerge: () => {} }
}

describe('executeCommand', () => {
  let ctx: ShellContext
  beforeEach(() => {
    ctx = makeContext(createFS(`test-registry-${Math.random()}`))
  })

  it('routes git subcommands', async () => {
    const result = await executeCommand({ command: 'git', args: ['init'] }, ctx)
    expect(result.output).toContain('Initialized')
  })
  it('routes fs commands', async () => {
    const result = await executeCommand({ command: 'pwd', args: [] }, ctx)
    expect(result.output).toBe('/')
  })
  it('returns error for unknown git subcommand', async () => {
    const result = await executeCommand({ command: 'git', args: ['rebase'] }, ctx)
    expect(result.isError).toBe(true)
  })
  it('returns Korean error for unknown command', async () => {
    const result = await executeCommand({ command: 'wget', args: [] }, ctx)
    expect(result.isError).toBe(true)
    expect(result.output).toContain('지원하지 않')
  })
  it('returns error for bare git', async () => {
    const result = await executeCommand({ command: 'git', args: [] }, ctx)
    expect(result.isError).toBe(true)
  })
})
