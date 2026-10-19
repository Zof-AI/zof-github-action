import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { randomUUID } from 'node:crypto';
import { safeWriteFiles, safeAppendFile } from '@zofai/evidence-spec';
import { verify, artifacts, markdown } from './index.js';
async function appendRunnerFile(path, text) {
    if (path)
        await safeAppendFile(dirname(resolve(path)), basename(path), text);
}
async function main() {
    const root = resolve(process.env.INPUT_PATH || process.env.GITHUB_WORKSPACE || '.');
    const base = process.env.INPUT_BASE || undefined;
    const head = process.env.INPUT_HEAD || undefined;
    const failOn = process.env.INPUT_FAIL_ON || 'high';
    if (!['info', 'low', 'medium', 'high', 'critical'].includes(failOn))
        throw new Error('INVALID_THRESHOLD');
    const report = await verify({ root, base, head, failOn: failOn });
    const temp = resolve(process.env.RUNNER_TEMP || tmpdir());
    if (/[\r\n]/.test(temp))
        throw new Error('INVALID_TEMP');
    const directory = 'zof-evidence-' + randomUUID();
    const output = join(temp, directory);
    await safeWriteFiles(temp, Object.entries(artifacts(report)).map(([name, body]) => ({ path: directory + '/' + name, content: body })), { createParents: true });
    await appendRunnerFile(process.env.GITHUB_OUTPUT, `evidence-directory=${output}\nresult=${report.evidence.execution.result}\n`);
    await appendRunnerFile(process.env.GITHUB_STEP_SUMMARY, markdown(report) + '\n');
    console.log(`Zof verification: ${report.evidence.execution.status}/${report.evidence.execution.result}; ${report.evidence.findings.length} finding(s).`);
    process.exitCode = report.exitCode;
}
main().catch(() => { console.error('ZOF_ACTION_ERROR: invalid configuration, unsafe path, unavailable Git history or incomplete input.'); process.exitCode = 2; });
