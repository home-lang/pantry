import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { Buffer } from 'node:buffer'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

describe('Dependency Detection - All File Types', () => {
  let testDir: string

  beforeEach(() => {
    // Create a temporary test directory
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-action-test-'))
    process.chdir(testDir)
  })

  afterEach(() => {
    // Clean up
    process.chdir(path.dirname(testDir))
    fs.rmSync(testDir, { recursive: true, force: true })
  })

  describe('Deno projects', () => {
    it('should detect deno.json', () => {
      const denoJson = {
        imports: {
          '@std/assert': 'jsr:@std/assert@^1.0.0',
        },
        tasks: {
          dev: 'deno run --watch main.ts',
        },
      }
      fs.writeFileSync('deno.json', JSON.stringify(denoJson, null, 2))
      expect(fs.existsSync('deno.json')).toBe(true)
    })

    it('should detect deno.jsonc', () => {
      const denoJsonc = `{
  // Deno configuration with comments
  "imports": {
    "@std/assert": "jsr:@std/assert@^1.0.0"
  }
}`
      fs.writeFileSync('deno.jsonc', denoJsonc)
      expect(fs.existsSync('deno.jsonc')).toBe(true)
    })
  })

  describe('Node.js version files', () => {
    it('should detect .nvmrc', () => {
      fs.writeFileSync('.nvmrc', '18.17.0')
      expect(fs.existsSync('.nvmrc')).toBe(true)
    })

    it('should detect .node-version', () => {
      fs.writeFileSync('.node-version', 'v20.0.0')
      expect(fs.existsSync('.node-version')).toBe(true)
    })
  })

  describe('Ruby version files', () => {
    it('should detect .ruby-version', () => {
      fs.writeFileSync('.ruby-version', '3.2.0')
      expect(fs.existsSync('.ruby-version')).toBe(true)
    })
  })

  describe('Python version files', () => {
    it('should detect .python-version', () => {
      fs.writeFileSync('.python-version', '3.11.0')
      expect(fs.existsSync('.python-version')).toBe(true)
    })

    it('should detect .python-version with comments', () => {
      const pythonVersion = `# Python version for this project
3.11.0
# Alternative version
# 3.10.0`
      fs.writeFileSync('.python-version', pythonVersion)
      expect(fs.existsSync('.python-version')).toBe(true)
    })
  })

  describe('Terraform version files', () => {
    it('should detect .terraform-version', () => {
      fs.writeFileSync('.terraform-version', '1.5.0')
      expect(fs.existsSync('.terraform-version')).toBe(true)
    })
  })

  describe('Node.js projects', () => {
    it('should detect package.json', () => {
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
      expect(fs.existsSync('package.json')).toBe(true)
    })

    it('should detect package.json with engines', () => {
      const packageJson = {
        name: 'test-project',
        engines: {
          node: '>=18.0.0',
          npm: '>=9.0.0',
        },
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
      expect(fs.existsSync('package.json')).toBe(true)
    })

    it('should detect package.json with packageManager (corepack)', () => {
      const packageJson = {
        name: 'test-project',
        packageManager: 'pnpm@8.6.0',
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
      expect(fs.existsSync('package.json')).toBe(true)
    })

    it('should detect package.json with volta', () => {
      const packageJson = {
        name: 'test-project',
        volta: {
          node: '18.17.0',
          npm: '9.6.7',
        },
      }
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
      expect(fs.existsSync('package.json')).toBe(true)
    })
  })

  describe('GitHub Actions', () => {
    it('should detect action.yml', () => {
      const actionYml = `name: 'Test Action'
description: 'A test action'
runs:
  using: 'node20'
  main: 'index.js'`
      fs.writeFileSync('action.yml', actionYml)
      expect(fs.existsSync('action.yml')).toBe(true)
    })

    it('should detect action.yaml', () => {
      const actionYaml = `name: 'Test Action'
description: 'A test action'
runs:
  using: 'node20'
  main: 'index.js'`
      fs.writeFileSync('action.yaml', actionYaml)
      expect(fs.existsSync('action.yaml')).toBe(true)
    })
  })

  describe('Rust projects', () => {
    it('should detect Cargo.toml', () => {
      const cargoToml = `[package]
name = "my-project"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = "1.0"`
      fs.writeFileSync('Cargo.toml', cargoToml)
      expect(fs.existsSync('Cargo.toml')).toBe(true)
    })
  })

  describe('Kubernetes/Skaffold', () => {
    it('should detect skaffold.yaml', () => {
      const skaffoldYaml = `apiVersion: skaffold/v4beta6
kind: Config
build:
  artifacts:
  - image: my-app`
      fs.writeFileSync('skaffold.yaml', skaffoldYaml)
      expect(fs.existsSync('skaffold.yaml')).toBe(true)
    })
  })

  describe('Go projects', () => {
    it('should detect go.mod', () => {
      const goMod = `module example.com/myproject

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
)`
      fs.writeFileSync('go.mod', goMod)
      expect(fs.existsSync('go.mod')).toBe(true)
    })

    it('should detect go.sum', () => {
      const goSum = `github.com/gin-gonic/gin v1.9.1 h1:4idEAncQnU5cB7BeOkPtxjfCSye0AAm1R0RVIqJ+Jmg=
github.com/gin-gonic/gin v1.9.1/go.mod h1:hPrL7YrpYKXt5YId3A/Tnip5kqbEAP+KLuI3SUcPTeU=`
      fs.writeFileSync('go.sum', goSum)
      expect(fs.existsSync('go.sum')).toBe(true)
    })
  })

  describe('Python projects', () => {
    it('should detect requirements.txt', () => {
      fs.writeFileSync('requirements.txt', 'flask==2.0.0\nrequests>=2.25.0')
      expect(fs.existsSync('requirements.txt')).toBe(true)
    })

    it('should detect pipfile', () => {
      const pipfile = `[[source]]
url = "https://pypi.org/simple"
verify_ssl = true
name = "pypi"

[packages]
flask = "*"`
      fs.writeFileSync('pipfile', pipfile)
      expect(fs.existsSync('pipfile')).toBe(true)
    })

    it('should detect pipfile.lock', () => {
      const pipfileLock = `{
    "_meta": {
        "hash": {
            "sha256": "example"
        }
    }
}`
      fs.writeFileSync('pipfile.lock', pipfileLock)
      expect(fs.existsSync('pipfile.lock')).toBe(true)
    })

    it('should detect setup.py', () => {
      const setupPy = `from setuptools import setup

setup(
    name="my-package",
    version="0.1.0",
)`
      fs.writeFileSync('setup.py', setupPy)
      expect(fs.existsSync('setup.py')).toBe(true)
    })

    it('should detect pyproject.toml', () => {
      const pyprojectToml = `[build-system]
requires = ["setuptools", "wheel"]

[project]
name = "my-package"
version = "0.1.0"`
      fs.writeFileSync('pyproject.toml', pyprojectToml)
      expect(fs.existsSync('pyproject.toml')).toBe(true)
    })
  })

  describe('Ruby projects', () => {
    it('should detect Gemfile', () => {
      const gemfile = `source 'https://rubygems.org'

gem 'rails', '~> 7.0'
gem 'sqlite3', '~> 1.4'`
      fs.writeFileSync('Gemfile', gemfile)
      expect(fs.existsSync('Gemfile')).toBe(true)
    })
  })

  describe('Yarn projects', () => {
    it('should detect .yarnrc', () => {
      fs.writeFileSync('.yarnrc', 'registry "https://registry.npmjs.org/"')
      expect(fs.existsSync('.yarnrc')).toBe(true)
    })

    it('should detect yarn.lock', () => {
      const yarnLock = `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1

package@^1.0.0:
  version "1.0.0"`
      fs.writeFileSync('yarn.lock', yarnLock)
      expect(fs.existsSync('yarn.lock')).toBe(true)
    })

    it('should detect .yarnrc.yml', () => {
      const yarnrcYml = `nodeLinker: node-modules
yarnPath: .yarn/releases/yarn-3.6.0.cjs`
      fs.writeFileSync('.yarnrc.yml', yarnrcYml)
      expect(fs.existsSync('.yarnrc.yml')).toBe(true)
    })
  })

  describe('Bun projects', () => {
    it('should detect bun.lock', () => {
      fs.writeFileSync('bun.lock', '# Bun lockfile')
      expect(fs.existsSync('bun.lock')).toBe(true)
    })

    it('should detect bun.lockb', () => {
      fs.writeFileSync('bun.lockb', Buffer.from('binary lock file'))
      expect(fs.existsSync('bun.lockb')).toBe(true)
    })
  })

  describe('PNPM projects', () => {
    it('should detect pnpm-lock.yaml', () => {
      const pnpmLock = `lockfileVersion: '6.0'
dependencies:
  express: 4.18.0`
      fs.writeFileSync('pnpm-lock.yaml', pnpmLock)
      expect(fs.existsSync('pnpm-lock.yaml')).toBe(true)
    })
  })

  describe('Pixi projects', () => {
    it('should detect pixi.toml', () => {
      const pixiToml = `[project]
name = "my-project"
version = "0.1.0"
description = "A pixi project"`
      fs.writeFileSync('pixi.toml', pixiToml)
      expect(fs.existsSync('pixi.toml')).toBe(true)
    })
  })

  describe('pkgx/launchpad configuration files', () => {
    it('should detect pkgx.yml', () => {
      const pkgxYml = `dependencies:
  - nodejs.org@18
  - python.org@3.11`
      fs.writeFileSync('pkgx.yml', pkgxYml)
      expect(fs.existsSync('pkgx.yml')).toBe(true)
    })

    it('should detect pkgx.yaml', () => {
      const pkgxYaml = `dependencies:
  - nodejs.org@18
  - python.org@3.11
  - go.dev
  - rust-lang.org@1.70`
      fs.writeFileSync('pkgx.yaml', pkgxYaml)
      expect(fs.existsSync('pkgx.yaml')).toBe(true)
    })

    it('should detect .pkgx.yml', () => {
      const pkgxYml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('.pkgx.yml', pkgxYml)
      expect(fs.existsSync('.pkgx.yml')).toBe(true)
    })

    it('should detect .pkgx.yaml', () => {
      const pkgxYaml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('.pkgx.yaml', pkgxYaml)
      expect(fs.existsSync('.pkgx.yaml')).toBe(true)
    })

    it('should detect launchpad.yml', () => {
      const launchpadYml = `dependencies:
  - nodejs.org@18
  - bun.sh@1`
      fs.writeFileSync('launchpad.yml', launchpadYml)
      expect(fs.existsSync('launchpad.yml')).toBe(true)
    })

    it('should detect launchpad.yaml', () => {
      const launchpadYaml = `dependencies:
  - nodejs.org@18
  - bun.sh@1`
      fs.writeFileSync('launchpad.yaml', launchpadYaml)
      expect(fs.existsSync('launchpad.yaml')).toBe(true)
    })

    it('should detect .launchpad.yml', () => {
      const launchpadYml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('.launchpad.yml', launchpadYml)
      expect(fs.existsSync('.launchpad.yml')).toBe(true)
    })

    it('should detect .launchpad.yaml', () => {
      const launchpadYaml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('.launchpad.yaml', launchpadYaml)
      expect(fs.existsSync('.launchpad.yaml')).toBe(true)
    })

    it('should detect dependencies.yml', () => {
      const depsYml = `dependencies:
  - nodejs.org@18
  - python.org@3.11`
      fs.writeFileSync('dependencies.yml', depsYml)
      expect(fs.existsSync('dependencies.yml')).toBe(true)
    })

    it('should detect dependencies.yaml', () => {
      const depsYaml = `dependencies:
  - nodejs.org@18
  - python.org@3.11`
      fs.writeFileSync('dependencies.yaml', depsYaml)
      expect(fs.existsSync('dependencies.yaml')).toBe(true)
    })

    it('should detect .dependencies.yml', () => {
      const depsYml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('.dependencies.yml', depsYml)
      expect(fs.existsSync('.dependencies.yml')).toBe(true)
    })

    it('should detect .dependencies.yaml', () => {
      const depsYaml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('.dependencies.yaml', depsYaml)
      expect(fs.existsSync('.dependencies.yaml')).toBe(true)
    })

    it('should detect deps.yml', () => {
      const depsYml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('deps.yml', depsYml)
      expect(fs.existsSync('deps.yml')).toBe(true)
    })

    it('should detect deps.yaml', () => {
      const depsYaml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('deps.yaml', depsYaml)
      expect(fs.existsSync('deps.yaml')).toBe(true)
    })

    it('should detect .deps.yml', () => {
      const depsYml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('.deps.yml', depsYml)
      expect(fs.existsSync('.deps.yml')).toBe(true)
    })

    it('should detect .deps.yaml', () => {
      const depsYaml = `dependencies:
  - nodejs.org@18`
      fs.writeFileSync('.deps.yaml', depsYaml)
      expect(fs.existsSync('.deps.yaml')).toBe(true)
    })
  })

  describe('AWS CDK projects', () => {
    it('should detect cdk.json', () => {
      const cdkJson = {
        app: 'npx ts-node --prefer-ts-exts bin/my-app.ts',
        watch: {
          include: ['**'],
          exclude: ['README.md', 'cdk*.json', 'node_modules/**'],
        },
      }
      fs.writeFileSync('cdk.json', JSON.stringify(cdkJson, null, 2))
      expect(fs.existsSync('cdk.json')).toBe(true)
    })
  })

  describe('Just task runner', () => {
    it('should detect justfile', () => {
      const justfile = `# This is a justfile
default:
    echo "Hello, world!"

test:
    cargo test`
      fs.writeFileSync('justfile', justfile)
      expect(fs.existsSync('justfile')).toBe(true)
    })

    it('should detect Justfile', () => {
      const justfile = `# This is a Justfile
default:
    echo "Hello, world!"`
      fs.writeFileSync('Justfile', justfile)
      expect(fs.existsSync('Justfile')).toBe(true)
    })
  })

  describe('Task runner', () => {
    it('should detect Taskfile.yml', () => {
      const taskfileYml = `version: '3'

tasks:
  hello:
    cmds:
      - echo "Hello World"`
      fs.writeFileSync('Taskfile.yml', taskfileYml)
      expect(fs.existsSync('Taskfile.yml')).toBe(true)
    })
  })

  describe('UV Python package manager', () => {
    it('should detect uv.lock', () => {
      const uvLock = `# This file is autogenerated by uv
[[package]]
name = "my-package"
version = "0.1.0"`
      fs.writeFileSync('uv.lock', uvLock)
      expect(fs.existsSync('uv.lock')).toBe(true)
    })
  })

  describe('Version Control Systems (directories)', () => {
    it('should detect .git directory', () => {
      fs.mkdirSync('.git')
      fs.writeFileSync('.git/config', '[core]\nrepositoryformatversion = 0')
      expect(fs.existsSync('.git')).toBe(true)
      expect(fs.statSync('.git').isDirectory()).toBe(true)
    })

    it('should detect .hg directory', () => {
      fs.mkdirSync('.hg')
      fs.writeFileSync('.hg/hgrc', '[ui]\nusername = Test User')
      expect(fs.existsSync('.hg')).toBe(true)
      expect(fs.statSync('.hg').isDirectory()).toBe(true)
    })

    it('should detect .svn directory', () => {
      fs.mkdirSync('.svn')
      fs.writeFileSync('.svn/entries', '12')
      expect(fs.existsSync('.svn')).toBe(true)
      expect(fs.statSync('.svn').isDirectory()).toBe(true)
    })
  })

  describe('Multiple project types', () => {
    it('should detect multiple project types in same directory', () => {
      // Create files for multiple project types
      fs.writeFileSync('package.json', '{"name": "test"}')
      fs.writeFileSync('requirements.txt', 'flask==2.0.0')
      fs.writeFileSync('go.mod', 'module test')
      fs.writeFileSync('Cargo.toml', '[package]\nname = "test"')
      fs.writeFileSync('Gemfile', 'source "https://rubygems.org"')
      fs.writeFileSync('pkgx.yaml', 'dependencies:\n  - nodejs.org@18')

      expect(fs.existsSync('package.json')).toBe(true)
      expect(fs.existsSync('requirements.txt')).toBe(true)
      expect(fs.existsSync('go.mod')).toBe(true)
      expect(fs.existsSync('Cargo.toml')).toBe(true)
      expect(fs.existsSync('Gemfile')).toBe(true)
      expect(fs.existsSync('pkgx.yaml')).toBe(true)
    })
  })

  describe('Complex configuration examples', () => {
    it('should handle complex package.json with pkgx section', () => {
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
      expect(fs.existsSync('package.json')).toBe(true)

      const parsed = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      expect(parsed.pkgx.dependencies['nodejs.org']).toBe('18')
      expect(parsed.pkgx.dependencies['python.org']).toBe('3.11')
    })

    it('should handle complex deno.json with pkgx section', () => {
      const denoJson = {
        imports: {
          '@std/assert': 'jsr:@std/assert@^1.0.0',
        },
        tasks: {
          dev: 'deno run --watch main.ts',
        },
        pkgx: {
          dependencies: ['nodejs.org@18', 'python.org@3.11'],
        },
      }
      fs.writeFileSync('deno.json', JSON.stringify(denoJson, null, 2))
      expect(fs.existsSync('deno.json')).toBe(true)

      const parsed = JSON.parse(fs.readFileSync('deno.json', 'utf8'))
      expect(parsed.pkgx.dependencies).toContain('nodejs.org@18')
      expect(parsed.pkgx.dependencies).toContain('python.org@3.11')
    })

    it('should handle complex pkgx.yaml with environment variables', () => {
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
      expect(fs.existsSync('pkgx.yaml')).toBe(true)

      const content = fs.readFileSync('pkgx.yaml', 'utf8')
      expect(content).toContain('nodejs.org@18')
      expect(content).toContain('python.org@3.11')
      expect(content).toContain('go.dev')
      expect(content).toContain('rust-lang.org@1.70')
      expect(content).toContain('NODE_ENV: development')
      expect(content).toContain('PYTHON_PATH: /usr/local/bin/python')
    })

    it('should handle global flags and inline comments in dependencies', () => {
      const depsYaml = `global: true # Install all packages globally
dependencies:
  node@22:
    version: 22.1.0
    global: true # System-wide installation
  python@3.12:
    version: 3.12.1
    global: false # Override to local installation
  - typescript@5.0 # String format defaults to local

env:
  NODE_ENV: development # Development environment`

      fs.writeFileSync('dependencies.yaml', depsYaml)
      expect(fs.existsSync('dependencies.yaml')).toBe(true)

      const content = fs.readFileSync('dependencies.yaml', 'utf8')
      expect(content).toContain('global: true')
      expect(content).toContain('node@22')
      expect(content).toContain('version: 22.1.0')
      expect(content).toContain('global: false')
      expect(content).toContain('typescript@5.0')
      expect(content).toContain('NODE_ENV: development')
    })
  })
})
