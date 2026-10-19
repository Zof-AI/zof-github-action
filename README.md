# Zof GitHub Action

Run offline static checks on pull-request changes, then inspect portable evidence, JSON, Markdown and SARIF reports. The bundled runtime never installs or executes checked-out application code, never uses a token and never uploads source. Use the versioned GitHub Action reference below. Completed workflow runs and release assets provide the execution evidence for each version.

<!-- ZOF_RELEASE_INSTALL_START -->
## Install from GitHub source

Requires Node.js 22 or 24, npm, and Git. Filesystem operations require Linux or macOS with Python 3.10 or newer; Windows file operations fail closed. Clone this repository and explicitly prepare its reviewed release dependencies:

```sh
git clone --branch v0.1.2 --depth 1 https://github.com/Zof-AI/zof-github-action.git
cd zof-github-action
node scripts/bootstrap.mjs --allow-network
npm ci --ignore-scripts --prefer-offline
npm run build
npm test
```

The bootstrap downloads only the exact versioned dependency assets from [GitHub Releases](https://github.com/Zof-AI/zof-github-action/releases), as listed in `scripts/release-dependencies.json`, verifies SHA256 and byte size, and adds them to the npm cache. It does not extract archives, run package scripts, collect application data, or send credentials. Downloads require the explicit flag and follow only HTTPS GitHub asset redirects. Installation then fetches ordinary third-party dependencies from npm. Use a writable npm cache; set `npm_config_cache` consistently for both commands if needed. An unavailable asset, changed hash, or oversized response stops installation.

<!-- ZOF_RELEASE_INSTALL_END -->

## Build and local validation

Use Node 22 or 24. Use the GitHub source installation above, then `npm run build` and `npm test`. `action.yml` uses the committed `dist/action.cjs` bundle with the Node24 GitHub Actions runtime. Never reference source-only files as an action release.

## Workflow examples

Three complete examples in `examples/` cover JavaScript, TypeScript and Python pull requests. They reference `Zof-AI/zof-github-action@v0.1.2`. The version tag is protected against changes; an exact reviewed release commit SHA may also be used. They do not run PR package scripts, use `pull_request_target`, receive production secrets or grant write permissions. Use `actions/upload-artifact` with `if: always()` and the action output to retain reports even when verification fails.

Inputs: `path` (checkout), `base` (baseline revision), `head` (optional exact candidate revision), `fail_on` (default high; info/low/medium/high/critical). The checkout must equal an explicit head and be clean. Outputs: `result` and `evidence-directory`. The evidence directory is created exclusively under runner temporary storage. A safe job summary is appended automatically. Exit 0 means completed check, 1 means configured finding and 2 means invalid/incomplete input. Optional hosted credentials are neither required nor read.

## Security and branch protection

Use GitHub-hosted runners for untrusted contributions, `contents: read`, disabled persisted checkout credentials and full required base/head history. Do not execute fork code with privileged credentials. Protect the default branch with the CI check and independent reviews; configure a protected release environment before publication. Do not auto-merge dependency updates. Static heuristics can miss defects and are not passing test evidence. Unsupported source is explicitly incomplete. Analyze inputs and configuration errors are handled without raw source or stderr disclosure.

The action emits reports; uploading SARIF requires a separately authorized code-scanning workflow with appropriate permissions. This action does not request those permissions. SARIF output uses local relative paths and does not fetch references. The package includes a generated third-party license inventory for its runtime bundle. See SECURITY.md, CONTRIBUTING.md and docs/RELEASE.md. Built independently for https://zof.ai; Licensed under [Apache-2.0](LICENSE).

## Filesystem and Git boundaries

Filesystem operations use bounded, directory-relative descriptors on Linux/macOS with Python 3.10 or newer. Symlinks, hard-linked inputs, special files and traversal are rejected. Open descriptors remain attached to the original directory when names change. File contents can still change during a read or snapshot; this is not an atomic filesystem snapshot. Windows filesystem operations fail closed; in-memory JSON validation and analysis do not require the file helper. Git reads use a private bounded snapshot: 256 MiB total, 32 MiB per source/object file, 50,000 entries and 64 directory levels. Repository hooks/configuration are not used; local `.git/info/exclude` and `.git/info/attributes` are preserved. External Git metadata, object alternates, grafts, sparse-checkout metadata, linked worktrees and submodules are unsupported. Limits and unsupported metadata cause an explicit error or incomplete result.
