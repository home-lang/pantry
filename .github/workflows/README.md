# GitHub Actions

The main entry points are:

- [CI](ci.yml): lint, type checks and the test suite.
- [Release](release.yml): build the native CLI for every supported release target and publish the public TypeScript package.
- [Publish changed packages](publish-changed-packages.yml): publish the recipes changed by a commit, or an explicitly selected package and version.
- [Mirror](mirror.yml): incrementally publish missing vendor archives and download recipes.
- [Registry integrity](registry-integrity.yml): check the published registry's integrity.

## Native package publication

Linux x64 and ARM packages run on matching Linux runners. Darwin ARM packages run on macOS, including recipes that download an upstream binary. A vendor archive still needs native Mach-O inspection, loader normalization and any required runtime health checks. A Linux download does not replace those checks.

Both the scheduled mirror and targeted publisher follow this rule. The targeted publisher preserves exact `domain@version` selectors when handing work to the macOS job. Custom recipes retain their own build configuration even when a vendor prebuilt exists.

For a bounded repair, dispatch **Publish changed packages** with an exact selector such as `bun.com@1.4.3`, a platform, and the number of versions to publish. Leave `platform` empty for all supported publisher platforms. `linux` selects both Linux architectures; `darwin-arm64` selects the native Mac job.

A successful matrix leg does not imply that the requested package supports that platform. For example, Chrome's recipe supports Linux x64. Confirm the actual uploaded package, version and platform in the publication receipt, then install the public artifact into a fresh consumer and run its required programs. Do not infer an ARM Chrome artifact from an otherwise successful ARM job.

## CLI release verification

Verify the actual public assets and their digests after a CLI release. The native executable should report the released version and source revision. Verify the public npm metadata and tarball integrity separately; an accepted asynchronous npm publication can precede availability from the public registry.
