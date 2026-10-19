import { verify } from '@zofai/cli';
import { redact, serializeEvidence } from '@zofai/evidence-spec';
export { verify };
export function markdown(report) {
    report = redact(report);
    const safe = (s) => s.replace(/[^\p{L}\p{N}._/:-]/gu, '_');
    return ['# Zof local verification', `Status: **${report.evidence.execution.status}/${report.evidence.execution.result}**`, '', '| Severity | Rule | Location |', '|---|---|---|', ...report.evidence.findings.map(f => `| ${f.severity} | ${safe(f.id)} | ${safe(f.path ?? '')}:${f.line ?? ''} |`), '', 'Static heuristics only. No tests or repository scripts were executed. No hosted request was made.'].join('\n');
}
export function sarif(report) {
    return redact({ version: '2.1.0', runs: [{ tool: { driver: { name: 'zof-cli', version: '0.1.0', rules: [...new Set(report.evidence.findings.map(f => f.id))].map(id => ({ id, shortDescription: { text: id } })) } }, results: report.evidence.findings.map(f => ({ ruleId: f.id, level: f.severity === 'critical' || f.severity === 'high' ? 'error' : f.severity === 'medium' ? 'warning' : 'note', message: { text: f.message }, ...(f.path ? { locations: [{ physicalLocation: { artifactLocation: { uri: f.path.split('/').map(encodeURIComponent).join('/'), uriBaseId: '%SRCROOT%' }, region: { startLine: f.line ?? 1 } } }] } : {}) })) }] });
}
export function artifacts(report) { return { 'evidence.json': serializeEvidence(report.evidence), 'report.json': JSON.stringify(redact(report), null, 2), 'report.md': markdown(report), 'report.sarif': JSON.stringify(sarif(report), null, 2) }; }
