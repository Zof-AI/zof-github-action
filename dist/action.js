import { mkdtemp, realpath, writeFile, open, constants } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { verify, artifacts, markdown } from './index.js';
async function appendRunnerFile(path, text) {
    if (!path)
        return;
    const handle = await open(path, constants.O_WRONLY | constants.O_APPEND | (constants.O_NOFOLLOW ?? 0));
    try {
        const stat = await handle.stat();
        if (!stat.isFile() || stat.size > 4 * 1024 * 1024)
            throw new Error('INVALID_RUNNER_FILE');
        await handle.writeFile(text);
    }
    finally {
        await handle.close();
    }
}
async function main() {
    const root = resolve(process.env.INPUT_PATH || process.env.GITHUB_WORKSPACE || '.');
    const base = process.env.INPUT_BASE || undefined;
    const head = process.env.INPUT_HEAD || undefined;
    const failOn = process.env.INPUT_FAIL_ON || 'high';
    if (!['info', 'low', 'medium', 'high', 'critical'].includes(failOn))
        throw new Error('INVALID_THRESHOLD');
    const report = await verify({ root, base, head, failOn: failOn });
    const temp = await realpath(process.env.RUNNER_TEMP || tmpdir());
    if (/[\r\n]/.test(temp))
        throw new Error('INVALID_TEMP');
    const output = await mkdtemp(join(temp, 'zof-evidence-'));
    for (const [name, body] of Object.entries(artifacts(report)))
        await writeFile(join(output, name), body, { flag: 'wx', mode: 0o600 });
    await appendRunnerFile(process.env.GITHUB_OUTPUT, `evidence-directory=${output}\nresult=${report.evidence.execution.result}\n`);
    await appendRunnerFile(process.env.GITHUB_STEP_SUMMARY, markdown(report) + '\n');
    console.log(`Zof verification: ${report.evidence.execution.status}/${report.evidence.execution.result}; ${report.evidence.findings.length} finding(s).`);
    process.exitCode = report.exitCode;
}
main().catch(() => { console.error('ZOF_ACTION_ERROR: invalid configuration, unsafe path, unavailable Git history or incomplete input.'); process.exitCode = 2; });
