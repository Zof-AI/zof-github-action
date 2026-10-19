# Zof GitHub Action

Run offline static checks on pull-request changes, then inspect portable evidence, JSON, Markdown and SARIF reports. The bundled runtime never installs or executes checked-out application code, never uses a token and never uploads source. This is an unpublished candidate; no real GitHub-hosted run or released reference is claimed.

## Build and local validation

Use Node 22 or 24. After foundation publication, run `npm ci --ignore-scripts`, `npm run build` and `npm test`. Candidate review stages reviewed dependency tarballs before building. `action.yml` uses the committed `dist/action.cjs` bundle with the Node24 GitHub Actions runtime. Never reference source-only files as an action release.

## Workflow examples

Three complete examples in `examples/` cover JavaScript, TypeScript and Python pull requests. They use a separately checked-out reviewed local action source. They do not run PR package scripts, use `pull_request_target`, receive production secrets or grant write permissions. Replace the local action checkout with an approved immutable public commit only after publication. Use `actions/upload-artifact` with `if: always()` and the action output to retain reports even when verification fails.

Inputs: `path` (checkout), `base` (baseline revision), `head` (optional exact candidate revision), `fail_on` (default high; info/low/medium/high/critical). The checkout must equal an explicit head and be clean. Outputs: `result` and `evidence-directory`. The evidence directory is created exclusively under runner temporary storage. A safe job summary is appended automatically. Exit 0 means completed check, 1 means configured finding and 2 means invalid/incomplete input. Optional hosted credentials are neither required nor read.

## Security and branch protection

Use GitHub-hosted runners for untrusted contributions, `contents: read`, disabled persisted checkout credentials and full required base/head history. Do not execute fork code with privileged credentials. Protect the default branch with the CI check and independent reviews; configure a protected release environment before publication. Do not auto-merge dependency updates. Static heuristics can miss defects and are not passing test evidence. Unsupported source is explicitly incomplete. Analyze inputs and configuration errors are handled without raw source or stderr disclosure.

The action emits reports; uploading SARIF requires a separately authorized code-scanning workflow with appropriate permissions. This action does not request those permissions. SARIF output uses local relative paths and does not fetch references. The package includes a generated third-party license inventory for its runtime bundle. See SECURITY.md, CONTRIBUTING.md and docs/RELEASE.md. Built independently for https://zof.ai; proposed Apache-2.0 licensing and publication require owner approval.
