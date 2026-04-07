import { describe, it, expect } from 'vitest'
import { parseCommand } from '@/lib/shell/parser'

describe('parseCommand', () => {
  it('parses simple command', () => {
    expect(parseCommand('ls')).toEqual({
      command: 'ls', args: [],
    })
  })

  it('parses command with args', () => {
    expect(parseCommand('git init')).toEqual({
      command: 'git', args: ['init'],
    })
  })

  it('parses git commit with quoted message', () => {
    expect(parseCommand('git commit -m "hello world"')).toEqual({
      command: 'git', args: ['commit', '-m', 'hello world'],
    })
  })

  it('parses single-quoted strings', () => {
    expect(parseCommand("echo 'hello world'")).toEqual({
      command: 'echo', args: ['hello world'],
    })
  })

  it('parses redirect operator >', () => {
    expect(parseCommand('echo "hello" > file.txt')).toEqual({
      command: 'echo', args: ['hello'],
      redirectOp: '>', redirectTarget: 'file.txt',
    })
  })

  it('parses append operator >>', () => {
    expect(parseCommand('echo "more" >> file.txt')).toEqual({
      command: 'echo', args: ['more'],
      redirectOp: '>>', redirectTarget: 'file.txt',
    })
  })

  it('parses Korean command', () => {
    expect(parseCommand('도움말')).toEqual({
      command: '도움말', args: [],
    })
  })

  it('handles extra whitespace', () => {
    expect(parseCommand('  git   add   file.txt  ')).toEqual({
      command: 'git', args: ['add', 'file.txt'],
    })
  })

  it('returns null for empty input', () => {
    expect(parseCommand('')).toBeNull()
    expect(parseCommand('   ')).toBeNull()
  })
})
