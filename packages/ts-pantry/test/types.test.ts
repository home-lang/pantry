import type {
  FetchPkgxPackageOptions,
  FetchProjectsOptions,
  GitHubContent,
  PackageFetchOptions,
  PkgxPackage,
  ProjectFolder,
} from '../src/types'
import { describe, expect, test } from 'bun:test'

describe('Types Module', () => {
  describe('ProjectFolder Interface', () => {
    test('should have correct structure', () => {
      const projectFolder: ProjectFolder = {
        name: 'test-project',
        url: 'https://example.com/test-project',
      }

      expect(projectFolder.name).toBe('test-project')
      expect(projectFolder.url).toBe('https://example.com/test-project')
      expect(typeof projectFolder.name).toBe('string')
      expect(typeof projectFolder.url).toBe('string')
    })

    test('should accept valid project folder data', () => {
      const validProjectFolders: ProjectFolder[] = [
        { name: 'nodejs.org', url: 'https://github.com/pkgxdev/pantry/tree/main/projects/nodejs.org' },
        { name: 'python.org', url: 'https://github.com/pkgxdev/pantry/tree/main/projects/python.org' },
        { name: 'agwa.name/git-crypt', url: 'https://github.com/pkgxdev/pantry/tree/main/projects/agwa.name/git-crypt' },
      ]

      validProjectFolders.forEach((folder) => {
        expect(folder.name).toBeDefined()
        expect(folder.url).toBeDefined()
        expect(typeof folder.name).toBe('string')
        expect(typeof folder.url).toBe('string')
        expect(folder.name.length).toBeGreaterThan(0)
        expect(folder.url.length).toBeGreaterThan(0)
      })
    })
  })

  describe('FetchProjectsOptions Interface', () => {
    test('should have optional apiUrl property', () => {
      const options1: FetchProjectsOptions = {}
      const options2: FetchProjectsOptions = {
        apiUrl: 'https://api.github.com/repos/pkgxdev/pantry/contents/projects',
      }

      expect(options1.apiUrl).toBeUndefined()
      expect(options2.apiUrl).toBe('https://api.github.com/repos/pkgxdev/pantry/contents/projects')
    })

    test('should accept valid API URLs', () => {
      const validOptions: FetchProjectsOptions[] = [
        {},
        { apiUrl: 'https://api.github.com' },
        { apiUrl: 'https://custom-api.example.com/projects' },
      ]

      validOptions.forEach((options) => {
        if (options.apiUrl) {
          expect(typeof options.apiUrl).toBe('string')
          expect(options.apiUrl).toMatch(/^https?:\/\//)
        }
      })
    })
  })

  describe('GitHubContent Interface', () => {
    test('should have correct structure for directory', () => {
      const dirContent: GitHubContent = {
        name: 'nodejs.org',
        path: 'projects/nodejs.org',
        sha: 'abc123',
        size: 0,
        url: 'https://api.github.com/repos/pkgxdev/pantry/contents/projects/nodejs.org',
        html_url: 'https://github.com/pkgxdev/pantry/tree/main/projects/nodejs.org',
        git_url: 'https://api.github.com/repos/pkgxdev/pantry/git/trees/abc123',
        download_url: null,
        type: 'dir',
        _links: {
          self: 'https://api.github.com/repos/pkgxdev/pantry/contents/projects/nodejs.org',
          git: 'https://api.github.com/repos/pkgxdev/pantry/git/trees/abc123',
          html: 'https://github.com/pkgxdev/pantry/tree/main/projects/nodejs.org',
        },
      }

      expect(dirContent.type).toBe('dir')
      expect(dirContent.download_url).toBeNull()
      expect(dirContent.size).toBe(0)
      expect(dirContent._links).toBeDefined()
      expect(dirContent._links.self).toBeDefined()
      expect(dirContent._links.git).toBeDefined()
      expect(dirContent._links.html).toBeDefined()
    })

    test('should have correct structure for file', () => {
      const fileContent: GitHubContent = {
        name: 'package.yml',
        path: 'projects/nodejs.org/package.yml',
        sha: 'def456',
        size: 1024,
        url: 'https://api.github.com/repos/pkgxdev/pantry/contents/projects/nodejs.org/package.yml',
        html_url: 'https://github.com/pkgxdev/pantry/blob/main/projects/nodejs.org/package.yml',
        git_url: 'https://api.github.com/repos/pkgxdev/pantry/git/blobs/def456',
        download_url: 'https://raw.githubusercontent.com/pkgxdev/pantry/main/projects/nodejs.org/package.yml',
        type: 'file',
        _links: {
          self: 'https://api.github.com/repos/pkgxdev/pantry/contents/projects/nodejs.org/package.yml',
          git: 'https://api.github.com/repos/pkgxdev/pantry/git/blobs/def456',
          html: 'https://github.com/pkgxdev/pantry/blob/main/projects/nodejs.org/package.yml',
        },
      }

      expect(fileContent.type).toBe('file')
      expect(fileContent.download_url).toBeDefined()
      expect(fileContent.size).toBeGreaterThan(0)
      expect(typeof fileContent.download_url).toBe('string')
    })

    test('should validate required properties', () => {
      const requiredProps = ['name', 'path', 'sha', 'size', 'url', 'html_url', 'git_url', 'type', '_links']
      const content: GitHubContent = {
        name: 'test',
        path: 'test/path',
        sha: 'sha123',
        size: 100,
        url: 'https://api.github.com/test',
        html_url: 'https://github.com/test',
        git_url: 'https://api.github.com/git/test',
        download_url: 'https://raw.githubusercontent.com/test',
        type: 'file',
        _links: {
          self: 'https://api.github.com/self',
          git: 'https://api.github.com/git',
          html: 'https://github.com/html',
        },
      }

      requiredProps.forEach((prop) => {
        expect(content).toHaveProperty(prop)
      })
    })
  })

  describe('PkgxPackage Interface', () => {
    test('should have correct required properties', () => {
      const pkg: PkgxPackage = {
        name: 'Node.js',
        domain: 'nodejs.org',
        description: 'JavaScript runtime',
        installCommand: 'pkgx nodejs.org',
        pkgxInstallCommand: 'sh <(curl https://pkgx.sh) nodejs.org -- $SHELL -i',
        launchpadInstallCommand: 'launchpad install nodejs.org',
        programs: ['node', 'npm'],
        companions: [],
        dependencies: [],
        versions: ['18.0.0', '20.0.0'],
      }

      expect(pkg.name).toBe('Node.js')
      expect(pkg.domain).toBe('nodejs.org')
      expect(pkg.description).toBe('JavaScript runtime')
      expect(pkg.installCommand).toBe('pkgx nodejs.org')
      expect(Array.isArray(pkg.programs)).toBe(true)
      expect(Array.isArray(pkg.companions)).toBe(true)
      expect(Array.isArray(pkg.dependencies)).toBe(true)
      expect(Array.isArray(pkg.versions)).toBe(true)
    })

    test('should have optional properties', () => {
      const pkgWithOptionals: PkgxPackage = {
        name: 'Node.js',
        domain: 'nodejs.org',
        description: 'JavaScript runtime',
        packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/nodejs.org/package.yml',
        homepageUrl: 'https://nodejs.org',
        githubUrl: 'https://github.com/nodejs/node',
        installCommand: 'pkgx nodejs.org',
        pkgxInstallCommand: 'sh <(curl https://pkgx.sh) nodejs.org -- $SHELL -i',
        launchpadInstallCommand: 'launchpad install nodejs.org',
        programs: ['node', 'npm'],
        companions: [],
        dependencies: [],
        versions: ['18.0.0', '20.0.0'],
        aliases: ['node'],
        fullPath: 'nodejs.org',
        fetchedAt: Date.now(),
      }

      expect(pkgWithOptionals.packageYmlUrl).toBeDefined()
      expect(pkgWithOptionals.homepageUrl).toBeDefined()
      expect(pkgWithOptionals.githubUrl).toBeDefined()
      expect(pkgWithOptionals.aliases).toBeDefined()
      expect(pkgWithOptionals.fullPath).toBeDefined()
      expect(pkgWithOptionals.fetchedAt).toBeDefined()
    })

    test('should validate array properties', () => {
      const pkg: PkgxPackage = {
        name: 'Test Package',
        domain: 'test.com',
        description: 'Test description',
        installCommand: 'pkgx test.com',
        pkgxInstallCommand: 'sh <(curl https://pkgx.sh) test.com -- $SHELL -i',
        launchpadInstallCommand: 'launchpad install test.com',
        programs: ['test1', 'test2'],
        companions: ['companion1'],
        dependencies: ['dep1', 'dep2'],
        versions: ['1.0.0', '2.0.0'],
        aliases: ['test', 'testing'],
      }

      expect(pkg.programs.length).toBe(2)
      expect(pkg.companions.length).toBe(1)
      expect(pkg.dependencies.length).toBe(2)
      expect(pkg.versions.length).toBe(2)
      expect(pkg.aliases?.length).toBe(2)

      pkg.programs.forEach(program => expect(typeof program).toBe('string'))
      pkg.companions.forEach(companion => expect(typeof companion).toBe('string'))
      pkg.dependencies.forEach(dep => expect(typeof dep).toBe('string'))
      pkg.versions.forEach(version => expect(typeof version).toBe('string'))
      pkg.aliases?.forEach(alias => expect(typeof alias).toBe('string'))
    })

    test('should handle empty arrays', () => {
      const pkg: PkgxPackage = {
        name: 'Empty Package',
        domain: 'empty.com',
        description: 'Package with empty arrays',
        installCommand: 'pkgx empty.com',
        pkgxInstallCommand: 'sh <(curl https://pkgx.sh) empty.com -- $SHELL -i',
        launchpadInstallCommand: 'launchpad install empty.com',
        programs: [],
        companions: [],
        dependencies: [],
        versions: [],
      }

      expect(pkg.programs.length).toBe(0)
      expect(pkg.companions.length).toBe(0)
      expect(pkg.dependencies.length).toBe(0)
      expect(pkg.versions.length).toBe(0)
    })
  })

  describe('PackageFetchOptions Interface', () => {
    test('should have correct default values', () => {
      const options: PackageFetchOptions = {}

      // All properties should be optional
      expect(options.timeout).toBeUndefined()
      expect(options.outputDir).toBeUndefined()
      expect(options.cacheDir).toBeUndefined()
      expect(options.debug).toBeUndefined()
      expect(options.limit).toBeUndefined()
      expect(options.cache).toBeUndefined()
      expect(options.cacheExpirationMinutes).toBeUndefined()
      expect(options.concurrency).toBeUndefined()
      expect(options.browser).toBeUndefined()
    })

    test('should accept valid option values', () => {
      const options: PackageFetchOptions = {
        timeout: 30000,
        outputDir: 'src/packages',
        cacheDir: '.cache/packages',
        debug: true,
        limit: 100,
        cache: true,
        cacheExpirationMinutes: 1440,
        concurrency: 10,
      }

      expect(options.timeout).toBe(30000)
      expect(options.outputDir).toBe('src/packages')
      expect(options.cacheDir).toBe('.cache/packages')
      expect(options.debug).toBe(true)
      expect(options.limit).toBe(100)
      expect(options.cache).toBe(true)
      expect(options.cacheExpirationMinutes).toBe(1440)
      expect(options.concurrency).toBe(10)
    })

    test('should validate numeric properties', () => {
      const options: PackageFetchOptions = {
        timeout: 30000,
        limit: 50,
        cacheExpirationMinutes: 720,
        concurrency: 5,
      }

      expect(typeof options.timeout).toBe('number')
      expect(typeof options.limit).toBe('number')
      expect(typeof options.cacheExpirationMinutes).toBe('number')
      expect(typeof options.concurrency).toBe('number')

      expect(options.timeout).toBeGreaterThan(0)
      expect(options.limit).toBeGreaterThan(0)
      expect(options.cacheExpirationMinutes).toBeGreaterThan(0)
      expect(options.concurrency).toBeGreaterThan(0)
    })

    test('should validate boolean properties', () => {
      const options: PackageFetchOptions = {
        debug: false,
        cache: true,
      }

      expect(typeof options.debug).toBe('boolean')
      expect(typeof options.cache).toBe('boolean')
    })

    test('should validate string properties', () => {
      const options: PackageFetchOptions = {
        outputDir: 'packages',
        cacheDir: '.cache',
      }

      expect(typeof options.outputDir).toBe('string')
      expect(typeof options.cacheDir).toBe('string')
      expect(options.outputDir!.length).toBeGreaterThan(0)
      expect(options.cacheDir!.length).toBeGreaterThan(0)
    })
  })

  describe('FetchPkgxPackageOptions Interface', () => {
    test('should have optional url property', () => {
      const options1: FetchPkgxPackageOptions = {}
      const options2: FetchPkgxPackageOptions = {
        url: 'https://pkgx.dev/nodejs.org',
      }

      expect(options1.url).toBeUndefined()
      expect(options2.url).toBe('https://pkgx.dev/nodejs.org')
    })

    test('should accept valid URLs', () => {
      const validOptions: FetchPkgxPackageOptions[] = [
        {},
        { url: 'https://pkgx.dev/nodejs.org' },
        { url: 'https://pkgx.dev/python.org' },
        { url: 'https://pkgx.dev/agwa.name/git-crypt' },
      ]

      validOptions.forEach((options) => {
        if (options.url) {
          expect(typeof options.url).toBe('string')
          expect(options.url).toMatch(/^https?:\/\//)
        }
      })
    })
  })

  describe('Type Integration Tests', () => {
    test('should work together in realistic scenarios', () => {
      // Simulate a complete package fetch operation
      const fetchOptions: PackageFetchOptions = {
        timeout: 30000,
        outputDir: 'src/packages',
        cacheDir: '.cache/packages',
        debug: false,
        cache: true,
        cacheExpirationMinutes: 1440,
        concurrency: 8,
      }

      const packageResult: PkgxPackage = {
        name: 'Node.js',
        domain: 'nodejs.org',
        description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
        packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/nodejs.org/package.yml',
        homepageUrl: 'https://nodejs.org',
        githubUrl: 'https://github.com/nodejs/node',
        installCommand: 'pkgx nodejs.org',
        pkgxInstallCommand: 'sh <(curl https://pkgx.sh) nodejs.org -- $SHELL -i',
        launchpadInstallCommand: 'launchpad install nodejs.org',
        programs: ['node', 'npm', 'npx'],
        companions: ['npm'],
        dependencies: [],
        versions: ['18.0.0', '20.0.0'],
        aliases: ['node'],
        fullPath: 'nodejs.org',
        fetchedAt: Date.now(),
      }

      const projectFolder: ProjectFolder = {
        name: 'nodejs.org',
        url: 'https://github.com/pkgxdev/pantry/tree/main/projects/nodejs.org',
      }

      // Validate the integration
      expect(fetchOptions.timeout).toBeGreaterThan(0)
      expect(packageResult.domain).toBe(projectFolder.name)
      expect(packageResult.aliases).toContain('node')
      expect(packageResult.programs.length).toBeGreaterThan(0)
    })

    test('should handle nested package structures', () => {
      const nestedPackage: PkgxPackage = {
        name: 'git-crypt',
        domain: 'agwa.name',
        description: 'Enable transparent encryption/decryption of files in a git repo',
        installCommand: 'pkgx agwa.name/git-crypt',
        pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +agwa.name/git-crypt -- $SHELL -i',
        launchpadInstallCommand: 'launchpad install git-crypt',
        programs: ['git-crypt'],
        companions: [],
        dependencies: [],
        versions: ['0.7.0'],
        fullPath: 'agwa.name/git-crypt',
        aliases: ['git-crypt'],
      }

      expect(nestedPackage.fullPath).toContain('/')
      expect(nestedPackage.fullPath).toBe('agwa.name/git-crypt')
      expect(nestedPackage.domain).toBe('agwa.name')
      expect(nestedPackage.aliases).toContain('git-crypt')
    })
  })
})
