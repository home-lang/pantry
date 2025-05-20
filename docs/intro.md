<p align="center"><img src="https://github.com/stacksjs/rpx/blob/main/.github/art/cover.jpg?raw=true" alt="Social Card of this repo"></p>

# Introduction

> For a better developer experience.

Launchpad is a lightweight package manager built on top of [pkgx](https://pkgx.sh), designed to simplify package installation and management. It provides a clean, intuitive interface with powerful features that make working with development tools and packages easier.

## What is Launchpad?

Launchpad serves as an alternative to package managers like Homebrew, focusing on:

- A consistent and simple CLI interface
- Automatic PATH management
- Easy installation of development tools
- Cross-platform support

At its core, Launchpad leverages pkgx, a next-generation package runner that allows you to use packages without installing them. Launchpad extends this functionality with convenient commands, better management of executables, and improved integration with your development workflow.

## Key Features

- 📦 **Package Management** _Install and manage packages directly using pkgx_
- 🔄 **Executable Shims** _Create executable shims for packages automatically_
- 🛠️ **pkgx Installation** _Install and manage the pkgx utility itself_
- 💻 **Dev Environment** _Dedicated command for the dev package for development environments_
- 🔧 **Auto-updates** _Configure automatic updates for pkgx_
- 🔌 **PATH Integration** _Automatically add installation directories to your PATH_
- 🪟 **Cross-platform** _Support for macOS, Linux, and Windows systems_

## How It Works

Launchpad works by managing the installation of pkgx and creating shims (executable scripts) that automatically run the correct versions of your tools. It can:

- Install pkgx itself without requiring another package manager
- Create shims for packages so they're available system-wide
- Configure automatic updates and PATH modifications
- Simplify the installation of the `dev` package for project-specific development environments

Whether you're setting up a new development machine, working on multiple projects with different tooling requirements, or just want a cleaner way to manage your packages, Launchpad offers a streamlined experience for modern developers.

## Get Started

It's rather simple to get your package development started:

```bash
# you may use this GitHub template or the following command:
bunx degit stacksjs/ts-starter my-pkg
cd my-pkg

 # if you don't have pnpm installed, run `npm i -g pnpm`
bun i # install all deps
bun run build # builds the library for production-ready use

# after you have successfully committed, you may create a "release"
bun run release # automates git commits, versioning, and changelog generations
```

_Check out the package.json scripts for more commands._

### Developer Experience (DX)

This Starter Kit comes pre-configured with the following:

- [Powerful Build Process](https://github.com/oven-sh/bun) - via Bun
- [Fully Typed APIs](https://www.typescriptlang.org/) - via TypeScript
- [Documentation-ready](https://vitepress.dev/) - via VitePress
- [CLI & Binary](https://www.npmjs.com/package/bunx) - via Bun & CAC
- [Be a Good Commitizen](https://www.npmjs.com/package/git-cz) - pre-configured Commitizen & git-cz setup to simplify semantic git commits, versioning, and changelog generations
- [Built With Testing In Mind](https://bun.sh/docs/cli/test) - pre-configured unit-testing powered by [Bun](https://bun.sh/docs/cli/test)
- [Renovate](https://renovatebot.com/) - optimized & automated PR dependency updates
- [ESLint](https://eslint.org/) - for code linting _(and formatting)_
- [GitHub Actions](https://github.com/features/actions) - runs your CI _(fixes code style issues, tags releases & creates its changelogs, runs the test suite, etc.)_

## Changelog

Please see our [releases](https://github.com/stacksjs/stacks/releases) page for more information on what has changed recently.

## Stargazers

[![Stargazers](https://starchart.cc/stacksjs/ts-starter.svg?variant=adaptive)](https://starchart.cc/stacksjs/ts-starter)

## Contributing

Please review the [Contributing Guide](https://github.com/stacksjs/contributing) for details.

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/stacksjs/stacks/discussions)

For casual chit-chat with others using this package:

[Join the Stacks Discord Server](https://discord.gg/stacksjs)

## Postcardware

Two things are true: Stacks OSS will always stay open-source, and we do love to receive postcards from wherever Stacks is used! 🌍 _We also publish them on our website. And thank you, Spatie_

Our address: Stacks.js, 12665 Village Ln #2306, Playa Vista, CA 90094

## Sponsors

We would like to extend our thanks to the following sponsors for funding Stacks development. If you are interested in becoming a sponsor, please reach out to us.

- [JetBrains](https://www.jetbrains.com/)
- [The Solana Foundation](https://solana.com/)

## Credits

- [Chris Breuer](https://github.com/chrisbbreuer)
- [All Contributors](https://github.com/stacksjs/rpx/graphs/contributors)

## License

The MIT License (MIT). Please see [LICENSE](https://github.com/stacksjs/ts-starter/tree/main/LICENSE.md) for more information.

Made with 💙

<!-- Badges -->

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/rpx/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/rpx -->
