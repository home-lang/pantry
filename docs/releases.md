# Release publication

Run the normal `bun run release:patch` from a reviewed checkout with the intended
Git identity and upstream. A push authenticated
as a maintainer starts the Releaser. Repository-token pushes from a workflow do
not trigger push workflows; use the explicit workflow procedure below. Check
required jobs and public artifacts before updating consumers.

Verify the native CLI assets and the `ts-pantry` npm package separately. Native
ZIPs can already be public while npm is still processing its upload. The native
`release-manifest.json` names the source commit and every platform archive's
size and SHA256. Compare those with the complete downloaded archives and the
release API's asset digests.

## npm acceptance and public availability

An npm upload can be accepted before its metadata and tarball become readable.
The CLI prints the package name, version, original SHA1 and SHA512, then reports
that public availability is pending if its initial wait expires.

The Releaser invokes publishing once and retains its exit code and output. A
pending accepted upload proceeds to the existing bounded public readback. That
readback requires the original package identity, metadata checksums, complete
archive bytes, and the manifest inside the archive to agree. A rejected upload,
missing receipt, conflicting receipt or mismatching archive fails the job.

The workflow retains `artifacts/npm-publication/publish.log` and `proof.json`,
including the original receipt and publisher exit code. If public availability
exceeds the readback deadline, preserve that evidence and verify the original
archive when it becomes readable. Check the workflow's recovery behavior before
resuming its failed job. Keep the accepted version and its tag; uploading that
version again can produce a staged-version conflict.


## Preparing a patch on a repository runner

The **Prepare Patch Release** workflow runs on Main with an exact
`expected_source_sha`. Its default `toolchain` operation generates the normal
manifest and lockfile update for public Bumpx 0.2.25, verifies both frozen
installs and tests the installed publisher's expected-source guard. It builds
the Action with that same normal dependency graph and uploads the manifest,
lockfiles and both Action bundles in `normal-locked-publisher-toolchain`. It does
not create a release commit or tag. Adopt those normal generated outputs as a
reviewed source commit.

After all thirteen source CI gates succeed on that commit, run the workflow's
`patch` operation with that exact commit hash. It uses the installed locked
publisher and the canonical `release:patch` script. Bumpx checks the expected
source after upstream synchronization and before release mutation. A newer Main
commit must pass its own CI before release.

Retain and verify `patch-release-original-receipt`: the producer outcome, Chris
Breuer's configured identity, source parent, version and remote commit/tag must
agree. Then dispatch the existing **Releaser** on that exact new tag, and **CI**
on Main, using the maintainer's normal GitHub access. The preparer creates no
registry upload and has no registry token. Verify the original native and npm
publication as described above before updating consumers. Do not rerun the
producer or replace an accepted version to recover a later job failure.


## Availability checks before an upload

For a public npm package with the default existing-version check enabled, only
a confirmed missing version permits a fresh upload. A registry outage,
authorization error, disconnected response or timeout stops before lifecycle
hooks and upload. An existing version is skipped only after its public tarball
is verified. Restore registry availability and inspect the original outcome
before continuing; an inconclusive check does not authorize another upload.
