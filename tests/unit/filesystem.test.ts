import { describe, it, expect, beforeEach } from 'vitest'
import { createFS, destroyFS, resolvePath } from '@/lib/shell/filesystem'

describe('resolvePath', () => {
  it('resolves absolute path as-is', () => {
    expect(resolvePath('/', '/hello.txt')).toBe('/hello.txt')
  })

  it('resolves relative path against cwd', () => {
    expect(resolvePath('/src', 'file.txt')).toBe('/src/file.txt')
  })

  it('resolves .. correctly', () => {
    expect(resolvePath('/src/lib', '../file.txt')).toBe('/src/file.txt')
  })

  it('resolves . correctly', () => {
    expect(resolvePath('/src', './file.txt')).toBe('/src/file.txt')
  })

  it('normalizes trailing slash', () => {
    expect(resolvePath('/', 'src/')).toBe('/src')
  })
})

describe('createFS / destroyFS', () => {
  it('creates a filesystem instance', () => {
    const fs = createFS('test-ns')
    expect(fs).toBeDefined()
    expect(typeof fs.promises.readdir).toBe('function')
  })

  it('destroys filesystem data', async () => {
    const fs = createFS('test-destroy')
    await fs.promises.writeFile('/test.txt', 'hello')
    await destroyFS('test-destroy')
    const fs2 = createFS('test-destroy')
    await expect(fs2.promises.readFile('/test.txt', 'utf8')).rejects.toThrow()
  })
})
