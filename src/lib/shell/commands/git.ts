import git from 'isomorphic-git'
import { diffLines } from 'diff'
import type { CommandResult, ShellContext } from '@/types'

type GitSubcommand = (args: string[], ctx: ShellContext) => Promise<CommandResult>

function errorResult(err: unknown, hint: string): CommandResult {
  const msg = err instanceof Error ? err.message : String(err)
  return { output: `${msg}\n💡 ${hint}`, isError: true }
}

export const gitCommands: Record<string, GitSubcommand> = {
  async init(_args, ctx) {
    try {
      const { fs, dir } = ctx
      await git.init({ fs, dir, defaultBranch: 'main' })
      await git.setConfig({ fs, dir, path: 'user.name', value: '학습자' })
      await git.setConfig({ fs, dir, path: 'user.email', value: 'learner@git101.dev' })
      return { output: 'Initialized empty Git repository' }
    } catch (err) {
      return errorResult(err, 'git init은 새로운 저장소를 만드는 명령어입니다.')
    }
  },

  async add(args, ctx) {
    try {
      const { fs, dir } = ctx
      if (args.length === 0) {
        return { output: 'Nothing specified, nothing added.\n💡 추가할 파일을 지정하세요. 예: git add <파일명>', isError: true }
      }

      if (args[0] === '.') {
        // Add all untracked/modified files
        const matrix = await git.statusMatrix({ fs, dir })
        for (const [filepath, head, workdir, stage] of matrix) {
          if (workdir !== head || stage !== workdir) {
            await git.add({ fs, dir, filepath })
          }
        }
      } else {
        for (const filepath of args) {
          await git.add({ fs, dir, filepath })
        }
      }

      return { output: '' }
    } catch (err) {
      return errorResult(err, '파일을 스테이징 영역에 추가하려면 git add <파일명>을 사용하세요.')
    }
  },

  async status(_args, ctx) {
    try {
      const { fs, dir } = ctx
      const matrix = await git.statusMatrix({ fs, dir })
      const staged: string[] = []
      const modified: string[] = []
      const untracked: string[] = []

      for (const [filepath, head, workdir, stage] of matrix) {
        if (head === 0 && stage === 0 && workdir === 2) {
          // Untracked
          untracked.push(filepath as string)
        } else if (head === 0 && stage === 2) {
          // New file staged
          staged.push(`new file:   ${filepath}`)
        } else if (head === 1 && stage === 2) {
          // Modified and staged
          staged.push(`modified:   ${filepath}`)
        } else if (head === 1 && workdir === 2 && stage === 1) {
          // Modified but not staged
          modified.push(filepath as string)
        }
      }

      const lines: string[] = []
      const branch = await git.currentBranch({ fs, dir }) || 'main'
      lines.push(`On branch ${branch}`)

      if (staged.length > 0) {
        lines.push('')
        lines.push('Changes to be committed:')
        for (const s of staged) {
          lines.push(`\t${s}`)
        }
      }

      if (modified.length > 0) {
        lines.push('')
        lines.push('Changes not staged for commit:')
        for (const m of modified) {
          lines.push(`\tmodified:   ${m}`)
        }
      }

      if (untracked.length > 0) {
        lines.push('')
        lines.push('Untracked files:')
        for (const u of untracked) {
          lines.push(`\t${u}`)
        }
      }

      if (staged.length === 0 && modified.length === 0 && untracked.length === 0) {
        lines.push('')
        lines.push('nothing to commit, working tree clean')
      }

      return { output: lines.join('\n') }
    } catch (err) {
      return errorResult(err, '현재 저장소의 상태를 확인하는 명령어입니다.')
    }
  },

  async commit(args, ctx) {
    try {
      const { fs, dir } = ctx
      const mIdx = args.indexOf('-m')
      if (mIdx === -1 || mIdx + 1 >= args.length) {
        return { output: 'error: switch `m` requires a value\n💡 커밋 메시지를 입력하세요. 예: git commit -m "메시지"', isError: true }
      }

      const message = args[mIdx + 1]
      const name = await git.getConfig({ fs, dir, path: 'user.name' }) || '학습자'
      const email = await git.getConfig({ fs, dir, path: 'user.email' }) || 'learner@git101.dev'
      const author = { name, email }

      let commitOptions: any = { fs, dir, message, author }

      // Handle merge commit
      if (ctx.pendingMerge) {
        const headOid = await git.resolveRef({ fs, dir, ref: 'HEAD' })
        commitOptions.parent = [headOid, ctx.pendingMerge.theirs]
        const oid = await git.commit(commitOptions)
        ctx.setPendingMerge(null)
        const short = oid.slice(0, 7)
        return { output: `[merge ${short}] ${message}` }
      }

      const oid = await git.commit(commitOptions)
      const branch = await git.currentBranch({ fs, dir }) || 'main'
      const short = oid.slice(0, 7)
      return { output: `[${branch} ${short}] ${message}` }
    } catch (err) {
      return errorResult(err, '변경사항을 커밋하려면 먼저 git add로 파일을 추가하세요.')
    }
  },

  async log(_args, ctx) {
    try {
      const { fs, dir } = ctx
      const commits = await git.log({ fs, dir, depth: 10 })
      const lines: string[] = []

      for (const entry of commits) {
        const short = entry.oid.slice(0, 7)
        const { commit } = entry
        const date = new Date(commit.author.timestamp * 1000).toLocaleString()
        lines.push(`commit ${short}`)
        lines.push(`Author: ${commit.author.name} <${commit.author.email}>`)
        lines.push(`Date:   ${date}`)
        lines.push('')
        lines.push(`    ${commit.message.trim()}`)
        lines.push('')
      }

      return { output: lines.join('\n').trimEnd() }
    } catch (err) {
      return errorResult(err, '커밋 기록을 확인하는 명령어입니다. 먼저 커밋을 만들어보세요.')
    }
  },

  async branch(args, ctx) {
    try {
      const { fs, dir } = ctx

      if (args.length === 0) {
        // List branches
        const branches = await git.listBranches({ fs, dir })
        const current = await git.currentBranch({ fs, dir })
        const lines = branches.map(b =>
          b === current ? `* ${b}` : `  ${b}`
        )
        return { output: lines.join('\n') }
      }

      // Create branch
      await git.branch({ fs, dir, ref: args[0] })
      return { output: '' }
    } catch (err) {
      return errorResult(err, '브랜치를 만들거나 목록을 확인하는 명령어입니다.')
    }
  },

  async checkout(args, ctx) {
    try {
      const { fs, dir } = ctx

      if (args.length === 0) {
        return { output: 'error: branch name required\n💡 전환할 브랜치 이름을 입력하세요.', isError: true }
      }

      if (args[0] === '-b') {
        if (args.length < 2) {
          return { output: 'error: branch name required after -b\n💡 새 브랜치 이름을 입력하세요.', isError: true }
        }
        const ref = args[1]
        await git.branch({ fs, dir, ref })
        await git.checkout({ fs, dir, ref })
        return { output: `Switched to a new branch '${ref}'` }
      }

      const ref = args[0]
      await git.checkout({ fs, dir, ref })
      return { output: `Switched to branch '${ref}'` }
    } catch (err) {
      return errorResult(err, '브랜치를 전환하는 명령어입니다. git branch로 브랜치 목록을 확인하세요.')
    }
  },

  async merge(args, ctx) {
    try {
      const { fs, dir } = ctx

      if (args.length === 0) {
        return { output: 'error: branch name required\n💡 병합할 브랜치 이름을 입력하세요.', isError: true }
      }

      const theirs = args[0]
      const name = await git.getConfig({ fs, dir, path: 'user.name' }) || '학습자'
      const email = await git.getConfig({ fs, dir, path: 'user.email' }) || 'learner@git101.dev'
      const author = { name, email }
      const ours = await git.currentBranch({ fs, dir }) || 'main'

      try {
        const mergeResult = await git.merge({
          fs, dir,
          ours,
          theirs,
          author,
          abortOnConflict: false,
        })

        // Check if the merge produced a clean result
        if (mergeResult.alreadyMerged) {
          return { output: 'Already up to date.' }
        }

        // Fast-forward or clean merge succeeded
        // Checkout the merged tree
        await git.checkout({ fs, dir, ref: ours })
        return { output: `Merge made: '${theirs}' into '${ours}'` }
      } catch (mergeErr: any) {
        // Merge conflict - isomorphic-git throws on conflicts
        const theirsOid = await git.resolveRef({ fs, dir, ref: theirs })
        ctx.setPendingMerge({ theirs: theirsOid })

        return {
          output: `Auto-merging failed\nCONFLICT (content): Merge conflict detected\n💡 충돌을 해결한 후 git add와 git commit을 사용하세요.`,
        }
      }
    } catch (err) {
      return errorResult(err, '브랜치를 병합하는 명령어입니다.')
    }
  },

  async diff(_args, ctx) {
    try {
      const { fs, dir } = ctx
      const matrix = await git.statusMatrix({ fs, dir })
      const lines: string[] = []

      for (const [filepath, head, workdir, _stage] of matrix) {
        // Only show unstaged changes: file exists in HEAD and workdir differs
        if (workdir === 2 && head >= 1) {
          let oldContent = ''
          try {
            // Read HEAD version
            const headCommit = await git.resolveRef({ fs, dir, ref: 'HEAD' })
            const { blob } = await git.readBlob({
              fs, dir, oid: headCommit, filepath: filepath as string,
            })
            oldContent = new TextDecoder().decode(blob)
          } catch {
            // File doesn't exist in HEAD
            oldContent = ''
          }

          let newContent = ''
          try {
            newContent = await fs.promises.readFile(`${dir === '/' ? '' : dir}/${filepath}`, 'utf8')
          } catch {
            newContent = ''
          }

          if (oldContent === newContent) continue

          const changes = diffLines(oldContent, newContent)
          lines.push(`diff --git a/${filepath} b/${filepath}`)
          lines.push(`--- a/${filepath}`)
          lines.push(`+++ b/${filepath}`)

          for (const part of changes) {
            const prefix = part.added ? '+' : part.removed ? '-' : ' '
            const partLines = part.value.replace(/\n$/, '').split('\n')
            for (const l of partLines) {
              lines.push(`${prefix}${l}`)
            }
          }

          lines.push('')
        } else if (head === 0 && workdir === 2) {
          // New untracked file
          let newContent = ''
          try {
            newContent = await fs.promises.readFile(`${dir === '/' ? '' : dir}/${filepath}`, 'utf8')
          } catch {
            newContent = ''
          }
          lines.push(`diff --git a/${filepath} b/${filepath}`)
          lines.push(`new file`)
          lines.push(`--- /dev/null`)
          lines.push(`+++ b/${filepath}`)
          const contentLines = newContent.replace(/\n$/, '').split('\n')
          for (const l of contentLines) {
            lines.push(`+${l}`)
          }
          lines.push('')
        }
      }

      if (lines.length === 0) {
        return { output: '' }
      }

      return { output: lines.join('\n').trimEnd() }
    } catch (err) {
      return errorResult(err, '변경사항을 확인하는 명령어입니다.')
    }
  },

  async remote(args, ctx) {
    try {
      const { fs, dir } = ctx

      if (args.length === 0) {
        // List remotes
        const remotes = await git.listRemotes({ fs, dir })
        return { output: remotes.map(r => r.remote).join('\n') }
      }

      if (args[0] === 'add') {
        if (args.length < 3) {
          return { output: 'error: usage: git remote add <name> <url>\n💡 리모트 저장소를 추가하세요.', isError: true }
        }
        const remote = args[1]
        const url = args[2]
        await git.addRemote({ fs, dir, remote, url })
        return { output: '' }
      }

      return { output: `error: Unknown subcommand: ${args[0]}\n💡 사용법: git remote add <이름> <URL>`, isError: true }
    } catch (err) {
      return errorResult(err, '원격 저장소를 관리하는 명령어입니다.')
    }
  },

  async push(args, ctx) {
    try {
      const { fs, dir } = ctx
      const branch = await git.currentBranch({ fs, dir }) || 'main'
      const remotes = await git.listRemotes({ fs, dir })
      const remoteName = args[0] || (remotes.length > 0 ? remotes[0].remote : 'origin')

      const lines = [
        'Enumerating objects... done.',
        'Counting objects... done.',
        'Writing objects... done.',
        `Branch '${branch}' pushed to '${remoteName}'`,
      ]
      return { output: lines.join('\n') }
    } catch (err) {
      return errorResult(err, '원격 저장소에 변경사항을 보내는 명령어입니다.')
    }
  },
}
