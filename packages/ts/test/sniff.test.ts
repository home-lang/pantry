import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import sniff from '../src/dev/sniff'

describe('Sniff - All File Types Detection', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-sniff-test-'))
    process.chdir(tempDir)
  })

  afterEach(() => {
    // Restore environment variables properly without replacing the entire process.env object
    Object.keys(process.env).forEach((key) => {
      delete process.env[key]
    })
    Object.assign(process.env, originalEnv)
    process.chdir(path.dirname(tempDir))
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('Deno projects', () => {
    it('should detect deno.json', async () => {
      const denoJson = {
        imports: {
          '@std/assert': 'jsr:@std/assert@^1.0.0',
        },
        tasks: {
          dev: 'deno run --watch main.ts',
        },
      }
      fs.writeFileSync('deno.json', JSON.stringify(denoJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'deno.land')).toBe(true)
    })

    it('should detect deno.jsonc', async () => {
      const denoJsonc = `{
  // Deno configuration with comments
  "imports": {
    "@std/assert": "jsr:@std/assert@^1.0.0"
  }
}`
      fs.writeFileSync('deno.jsonc', denoJsonc)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'deno.land')).toBe(true)
    })

    it('should detect deno.json with pkgx dependencies', async () => {
      const denoJson = {
        imports: {
          '@std/assert': 'jsr:@std/assert@^1.0.0',
        },
        pkgx: {
          dependencies: ['nodejs.org@18', 'python.org@3.11'],
        },
      }
      fs.writeFileSync('deno.json', JSON.stringify(denoJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'deno.land')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'python.org')).toBe(true)
    })
  })

  describe('Node.js version files', () => {
    it('should detect .nvmrc', async () => {
      fs.writeFileSync('.nvmrc', '18.17.0')

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should detect .node-version', async () => {
      fs.writeFileSync('.node-version', 'v20.0.0')

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })
  })

  describe('Ruby version files', () => {
    it('should detect .ruby-version', async () => {
      fs.writeFileSync('.ruby-version', '3.2.0')

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'ruby-lang.org')).toBe(true)
    })
  })

  describe('Python version files', () => {
    it('should detect .python-version', async () => {
      fs.writeFileSync('.python-version', '3.11.0')

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'python.org')).toBe(true)
    })

    it('should detect .python-version with comments', async () => {
      const pythonVersion = `# Python version for this project
3.11.0
# Alternative version
# 3.10.0`
      fs.writeFileSync('.python-version', pythonVersion)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'python.org')).toBe(true)
    })
  })

  describe('Terraform version files', () => {
    it('should detect .terraform-version', async () => {
      fs.writeFileSync('.terraform-version', '1.5.0')

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'terraform.io')).toBe(true)
    })
  })

  describe('Node.js projects', () => {
    it('should detect package.json', async () => {
      const packageJson = {
        name: 'test-project',
        version: '1.0.0',
        scripts: {
          dev: 'node server.js',
          build: 'tsc',
        },
        devDependencies: {
          typescript: '^5.0.0',
        },
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should detect package.json with engines', async () => {
      const packageJson = {
        name: 'test-project',
        engines: {
          node: '>=18.0.0',
          npm: '>=9.0.0',
        },
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'npmjs.com')).toBe(true)
    })

    it('should detect package.json with packageManager (corepack)', async () => {
      const packageJson = {
        name: 'test-project',
        packageManager: 'pnpm@8.6.0',
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'pnpm.io')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should detect package.json with packageManager: bun', async () => {
      const packageJson = {
        name: 'bun-project',
        packageManager: 'bun@1.2.0',
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'bun.sh')).toBe(true)
      // Should NOT install Node.js when Bun is the package manager
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(false)
    })

    it('should detect package.json with packageManager: bun (latest version)', async () => {
      const packageJson = {
        name: 'bun-project',
        packageManager: 'bun@latest',
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'bun.sh')).toBe(true)
      // Should NOT install Node.js when Bun is the package manager
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(false)
    })

    it('should detect package.json with packageManager: bun (no version)', async () => {
      const packageJson = {
        name: 'bun-project',
        packageManager: 'bun',
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'bun.sh')).toBe(true)
      // Should NOT install Node.js when Bun is the package manager
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(false)
    })

    it('should detect package.json with packageManager: npm and install Node.js', async () => {
      const packageJson = {
        name: 'npm-project',
        packageManager: 'npm@10.2.4',
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'npmjs.com')).toBe(true)
      // Should install Node.js when npm is the package manager
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should detect package.json with packageManager: yarn and install Node.js', async () => {
      const packageJson = {
        name: 'yarn-project',
        packageManager: 'yarn@4.0.0',
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'yarnpkg.com')).toBe(true)
      // Should install Node.js when yarn is the package manager
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should detect package.json with volta', async () => {
      const packageJson = {
        name: 'test-project',
        volta: {
          node: '18.17.0',
          npm: '9.6.7',
        },
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'npmjs.com')).toBe(true)
    })
  })

  describe('GitHub Actions', () => {
    it('should detect action.yml', async () => {
      const actionYml = `name: 'Test Action'
description: 'A test action'
runs:
  using: 'node20'
  main: 'index.js'`
      fs.writeFileSync('action.yml', actionYml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should detect action.yaml', async () => {
      const actionYaml = `name: 'Test Action'
description: 'A test action'
runs:
  using: 'node20'
  main: 'index.js'`
      fs.writeFileSync('action.yaml', actionYaml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })
  })

  describe('Rust projects', () => {
    it('should detect Cargo.toml', async () => {
      const cargoToml = `[package]
name = "my-project"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = "1.0"`
      fs.writeFileSync('Cargo.toml', cargoToml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'rust-lang.org')).toBe(true)
    })
  })

  describe('Kubernetes/Skaffold', () => {
    it('should detect skaffold.yaml', async () => {
      const skaffoldYaml = `apiVersion: skaffold/v4beta6
kind: Config
build:
  artifacts:
  - image: my-app`
      fs.writeFileSync('skaffold.yaml', skaffoldYaml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'skaffold.dev')).toBe(true)
    })
  })

  describe('Go projects', () => {
    it('should detect go.mod', async () => {
      const goMod = `module example.com/myproject

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
)`
      fs.writeFileSync('go.mod', goMod)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'go.dev')).toBe(true)
    })

    it('should detect go.sum', async () => {
      const goSum = `github.com/gin-gonic/gin v1.9.1 h1:4idEAncQnU5cB7BeOkPtxjfCSye0AAm1R0RVIqJ+Jmg=
github.com/gin-gonic/gin v1.9.1/go.mod h1:hPrL7YrpYKXt5YId3A/Tnip5kqbEAP+KLuI3SUcPTeU=`
      fs.writeFileSync('go.sum', goSum)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'go.dev')).toBe(true)
    })
  })

  describe('Python projects', () => {
    it('should detect requirements.txt', async () => {
      fs.writeFileSync('requirements.txt', 'flask==2.0.0\nrequests>=2.25.0')

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'pip.pypa.io')).toBe(true)
    })

    it('should detect pipfile', async () => {
      const pipfile = `[[source]]
url = "https://pypi.org/simple"
verify_ssl = true
name = "pypi"

[packages]
flask = "*"`
      fs.writeFileSync('pipfile', pipfile)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'pip.pypa.io')).toBe(true)
    })

    it('should detect pipfile.lock', async () => {
      const pipfileLock = `{
    "_meta": {
        "hash": {
            "sha256": "example"
        }
    }
}`
      fs.writeFileSync('pipfile.lock', pipfileLock)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'pip.pypa.io')).toBe(true)
    })

    it('should detect setup.py', async () => {
      const setupPy = `from setuptools import setup

setup(
    name="my-package",
    version="0.1.0",
)`
      fs.writeFileSync('setup.py', setupPy)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'pip.pypa.io')).toBe(true)
    })

    it('should detect pyproject.toml', async () => {
      const pyprojectToml = `[build-system]
requires = ["setuptools", "wheel"]

[project]
name = "my-package"
version = "0.1.0"`
      fs.writeFileSync('pyproject.toml', pyprojectToml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'python.org')).toBe(true)
    })
  })

  describe('Ruby projects', () => {
    it('should detect Gemfile', async () => {
      const gemfile = `source 'https://rubygems.org'

gem 'rails', '~> 7.0'
gem 'sqlite3', '~> 1.4'`
      fs.writeFileSync('Gemfile', gemfile)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'ruby-lang.org')).toBe(true)
    })
  })

  describe('Yarn projects', () => {
    it('should detect .yarnrc', async () => {
      fs.writeFileSync('.yarnrc', 'registry "https://registry.npmjs.org/"')

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'classic.yarnpkg.com')).toBe(true)
    })

    it('should detect yarn.lock', async () => {
      const yarnLock = `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1

package@^1.0.0:
  version "1.0.0"`
      fs.writeFileSync('yarn.lock', yarnLock)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'yarnpkg.com')).toBe(true)
    })

    it('should detect .yarnrc.yml', async () => {
      const yarnrcYml = `nodeLinker: node-modules
yarnPath: .yarn/releases/yarn-3.6.0.cjs`
      fs.writeFileSync('.yarnrc.yml', yarnrcYml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'yarnpkg.com')).toBe(true)
    })
  })

  describe('Bun projects', () => {
    it('should detect bun.lock', async () => {
      fs.writeFileSync('bun.lock', '# Bun lockfile')

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'bun.sh')).toBe(true)
    })

    it('should detect bun.lockb', async () => {
      fs.writeFileSync('bun.lockb', Buffer.from('binary lock file'))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'bun.sh')).toBe(true)
    })
  })

  describe('PNPM projects', () => {
    it('should detect pnpm-lock.yaml', async () => {
      const pnpmLock = `lockfileVersion: '6.0'
dependencies:
  express: 4.18.0`
      fs.writeFileSync('pnpm-lock.yaml', pnpmLock)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'pnpm.io')).toBe(true)
    })
  })

  describe('Pixi projects', () => {
    it('should detect pixi.toml', async () => {
      const pixiToml = `[project]
name = "my-project"
version = "0.1.0"
description = "A pixi project"`
      fs.writeFileSync('pixi.toml', pixiToml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'prefix.dev')).toBe(true)
    })
  })

  describe('pkgx/launchpad configuration files', () => {
    it('should detect pkgx.yml', async () => {
      const pkgxYml = `dependencies:
  - nodejs.org@18
  - python.org@3.11`
      fs.writeFileSync('pkgx.yml', pkgxYml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'python.org')).toBe(true)
    })

    it('should detect pkgx.yaml', async () => {
      const pkgxYaml = `dependencies:
  - nodejs.org@18
  - python.org@3.11
  - go.dev
  - rust-lang.org@1.70`
      fs.writeFileSync('pkgx.yaml', pkgxYaml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'python.org')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'go.dev')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'rust-lang.org')).toBe(true)
    })

    it('should detect .pkgx.yml', async () => {
      const pkgxYml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('.pkgx.yml', pkgxYml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should detect .pkgx.yaml', async () => {
      const pkgxYaml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('.pkgx.yaml', pkgxYaml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should detect launchpad.yml', async () => {
      const launchpadYml = `dependencies:
  - nodejs.org@18
  - bun.sh@1`
      fs.writeFileSync('launchpad.yml', launchpadYml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'bun.sh')).toBe(true)
    })

    it('should detect launchpad.yaml', async () => {
      const launchpadYaml = `dependencies:
  - nodejs.org@18
  - bun.sh@1`
      fs.writeFileSync('launchpad.yaml', launchpadYaml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'bun.sh')).toBe(true)
    })

    it('should detect .launchpad.yml', async () => {
      const launchpadYml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('.launchpad.yml', launchpadYml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should detect .launchpad.yaml', async () => {
      const launchpadYaml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('.launchpad.yaml', launchpadYaml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should detect dependencies.yml', async () => {
      const depsYml = `dependencies:
  - nodejs.org@18
  - python.org@3.11`
      fs.writeFileSync('dependencies.yml', depsYml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'python.org')).toBe(true)
    })

    it('should detect dependencies.yaml', async () => {
      const depsYaml = `dependencies:
  - nodejs.org@18
  - python.org@3.11`
      fs.writeFileSync('dependencies.yaml', depsYaml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'python.org')).toBe(true)
    })

    it('should detect .dependencies.yml', async () => {
      const depsYml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('.dependencies.yml', depsYml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should detect .dependencies.yaml', async () => {
      const depsYaml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('.dependencies.yaml', depsYaml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should detect deps.yml', async () => {
      const depsYml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('deps.yml', depsYml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should detect deps.yaml', async () => {
      const depsYaml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('deps.yaml', depsYaml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should detect .deps.yml', async () => {
      const depsYml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('.deps.yml', depsYml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should detect .deps.yaml', async () => {
      const depsYaml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('.deps.yaml', depsYaml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })
  })

  describe('AWS CDK projects', () => {
    it('should detect cdk.json', async () => {
      const cdkJson = {
        app: 'npx ts-node --prefer-ts-exts bin/my-app.ts',
        watch: {
          include: ['**'],
          exclude: ['README.md', 'cdk*.json', 'node_modules/**'],
        },
      }
      fs.writeFileSync('cdk.json', JSON.stringify(cdkJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'aws.amazon.com/cdk')).toBe(true)
    })
  })

  describe('Just task runner', () => {
    it('should detect justfile', async () => {
      const justfile = `# This is a justfile
default:
    echo "Hello, world!"

test:
    cargo test`
      fs.writeFileSync('justfile', justfile)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'just.systems')).toBe(true)
    })

    it('should detect Justfile', async () => {
      const justfile = `# This is a Justfile
default:
    echo "Hello, world!"`
      fs.writeFileSync('Justfile', justfile)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'just.systems')).toBe(true)
    })
  })

  describe('Task runner', () => {
    it('should detect Taskfile.yml', async () => {
      const taskfileYml = `version: '3'

tasks:
  hello:
    cmds:
      - echo "Hello World"`
      fs.writeFileSync('Taskfile.yml', taskfileYml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'taskfile.dev')).toBe(true)
    })
  })

  describe('UV Python package manager', () => {
    it('should detect uv.lock', async () => {
      const uvLock = `# This file is autogenerated by uv
[[package]]
name = "my-package"
version = "0.1.0"`
      fs.writeFileSync('uv.lock', uvLock)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'astral.sh/uv')).toBe(true)
    })
  })

  describe('Version Control Systems (directories)', () => {
    it('should detect .git directory', async () => {
      fs.mkdirSync('.git')
      fs.writeFileSync('.git/config', '[core]\nrepositoryformatversion = 0')

      const result = await sniff({ string: tempDir })
      // Git detection depends on platform - only added on non-macOS
      if (process.platform !== 'darwin') {
        expect(result.pkgs.some(pkg => pkg.project === 'git-scm.org')).toBe(true)
      }
    })

    it('should detect .hg directory', async () => {
      fs.mkdirSync('.hg')
      fs.writeFileSync('.hg/hgrc', '[ui]\nusername = Test User')

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'mercurial-scm.org')).toBe(true)
    })

    it('should detect .svn directory', async () => {
      fs.mkdirSync('.svn')
      fs.writeFileSync('.svn/entries', '12')

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'apache.org/subversion')).toBe(true)
    })
  })

  describe('Multiple project types', () => {
    it('should detect multiple project types in same directory', async () => {
      // Create files for multiple project types
      fs.writeFileSync('package.json', '{"name": "test"}')
      fs.writeFileSync('requirements.txt', 'flask==2.0.0')
      fs.writeFileSync('go.mod', 'module test')
      fs.writeFileSync('Cargo.toml', '[package]\nname = "test"')
      fs.writeFileSync('Gemfile', 'source "https://rubygems.org"')
      fs.writeFileSync('pkgx.yaml', 'dependencies:\n  - nodejs.org@18')

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'pip.pypa.io')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'go.dev')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'rust-lang.org')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'ruby-lang.org')).toBe(true)
    })
  })

  describe('Complex configuration examples', () => {
    it('should handle complex package.json with pkgx section', async () => {
      const packageJson = {
        name: 'complex-project',
        version: '1.0.0',
        engines: {
          node: '>=18.0.0',
          npm: '>=9.0.0',
        },
        packageManager: 'pnpm@8.6.0',
        volta: {
          node: '18.17.0',
          npm: '9.6.7',
        },
        pkgx: {
          dependencies: {
            'nodejs.org': '18',
            'python.org': '3.11',
          },
        },
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'python.org')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'npmjs.com')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'pnpm.io')).toBe(true)
    })

    it('should handle complex pkgx.yaml with environment variables', async () => {
      const pkgxYaml = `dependencies:
  - nodejs.org@18
  - python.org@3.11
  - go.dev
  - rust-lang.org@1.70

env:
  NODE_ENV: development
  PYTHON_PATH: /usr/local/bin/python
  GO_ENV: development
  RUST_LOG: debug`

      fs.writeFileSync('pkgx.yaml', pkgxYaml)

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'python.org')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'go.dev')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'rust-lang.org')).toBe(true)
      expect(result.env.NODE_ENV).toBe('development')
      expect(result.env.PYTHON_PATH).toBe('/usr/local/bin/python')
      expect(result.env.GO_ENV).toBe('development')
      expect(result.env.RUST_LOG).toBe('debug')
    })
  })

  describe('Auto-detection logic with enhanced rules', () => {
    it('should auto-detect pnpm from packageManager and infer Node.js when no deps files present', async () => {
      const packageJson = {
        name: 'pnpm-test',
        version: '1.0.0',
        packageManager: 'pnpm@8.15.0',
        dependencies: {
          express: '^4.18.0',
        },
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'pnpm.io')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should auto-detect pnpm from engines.pnpm and infer Node.js', async () => {
      const packageJson = {
        name: 'pnpm-engines-test',
        version: '1.0.0',
        engines: {
          node: '>=18',
          pnpm: '>=8.0.0',
        },
        dependencies: {
          express: '^4.18.0',
        },
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'pnpm.io')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should NOT infer Node.js when bun.lock is present', async () => {
      const packageJson = {
        name: 'bun-test',
        version: '1.0.0',
        dependencies: {
          express: '^4.18.0',
        },
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
      fs.writeFileSync('bun.lock', '')

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'bun.sh')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(false)
    })

    it('should NOT infer Node.js when packageManager is bun even with engines.node', async () => {
      const packageJson = {
        name: 'bun-with-engines-test',
        version: '1.0.0',
        packageManager: 'bun@1.2.0',
        engines: {
          node: '>=18.0.0',
        },
        dependencies: {
          express: '^4.18.0',
        },
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'bun.sh')).toBe(true)
      // Should NOT install Node.js even when engines.node is present, because packageManager is bun
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(false)
    })

    it('should handle complex package.json with packageManager: bun', async () => {
      const packageJson = {
        name: 'complex-bun-project',
        version: '1.0.0',
        packageManager: 'bun@1.2.20',
        scripts: {
          dev: 'bun run dev',
          build: 'bun run build',
          test: 'bun test',
        },
        dependencies: {
          'express': '^4.18.0',
          '@types/express': '^4.17.0',
        },
        devDependencies: {
          '@types/bun': 'latest',
        },
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'bun.sh')).toBe(true)
      // Should NOT install Node.js when Bun is explicitly the package manager
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(false)
    })

    it('should NOT infer Node.js when deps.yaml is present', async () => {
      const packageJson = {
        name: 'deps-test',
        version: '1.0.0',
        dependencies: {
          express: '^4.18.0',
        },
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
      fs.writeFileSync('deps.yaml', 'dependencies:\n  - python.org\n')

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'python.org')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(false)
    })

    it('should detect pnpm from pnpm-lock.yaml and infer Node.js', async () => {
      const packageJson = {
        name: 'redline-simulation',
        version: '1.0.0',
        scripts: {
          build: 'pnpm build',
          dev: 'pnpm dev',
        },
        dependencies: {
          express: '^4.18.0',
        },
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
      fs.writeFileSync('pnpm-lock.yaml', 'lockfileVersion: 5.4\n')

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'pnpm.io')).toBe(true)
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })

    it('should infer Node.js when only package.json is present (no other lock files or deps files)', async () => {
      const packageJson = {
        name: 'simple-node-test',
        version: '1.0.0',
        dependencies: {
          express: '^4.18.0',
        },
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))

      const result = await sniff({ string: tempDir })
      expect(result.pkgs.some(pkg => pkg.project === 'nodejs.org')).toBe(true)
    })
  })

  describe('Error handling', () => {
    it('should throw error for non-directory', async () => {
      fs.writeFileSync('not-a-directory', 'content')

      await expect(sniff({ string: path.join(tempDir, 'not-a-directory') })).rejects.toThrow('not a directory')
    })

    it('should handle empty directory', async () => {
      const emptyDir = path.join(tempDir, 'empty')
      fs.mkdirSync(emptyDir)

      const result = await sniff({ string: emptyDir })
      expect(result.pkgs).toEqual([])
      expect(result.env).toEqual({})
    })
  })
})
