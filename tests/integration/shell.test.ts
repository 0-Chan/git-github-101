import { describe, it, expect, beforeEach } from 'vitest'
import { Shell } from '@/lib/shell/Shell'

describe('Shell integration', () => {
  let shell: Shell
  beforeEach(async () => {
    shell = new Shell(`test-shell-${Math.random()}`)
    await shell.init()
  })

  it('executes touch and ls', async () => {
    await shell.execute('touch hello.txt')
    const result = await shell.execute('ls')
    expect(result.output).toContain('hello.txt')
  })
  it('executes git init', async () => {
    const result = await shell.execute('git init')
    expect(result.output).toContain('Initialized')
  })
  it('handles echo with redirect', async () => {
    await shell.execute('echo "hello world" > test.txt')
    const result = await shell.execute('cat test.txt')
    expect(result.output).toBe('hello world')
  })
  it('manages cwd with cd', async () => {
    await shell.execute('mkdir mydir')
    await shell.execute('cd mydir')
    expect(shell.cwd).toBe('/mydir')
  })
  it('returns error for unknown commands', async () => {
    const result = await shell.execute('blah')
    expect(result.isError).toBe(true)
  })
  it('full git workflow: init → add → commit', async () => {
    await shell.execute('git init')
    await shell.execute('touch hello.txt')
    await shell.execute('git add hello.txt')
    const result = await shell.execute('git commit -m "first commit"')
    expect(result.output).toContain('first commit')
  })
})
