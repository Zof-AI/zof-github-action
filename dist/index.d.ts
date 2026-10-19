import { verify, type Verification } from '@zof-ai/cli';
export { verify };
export declare function markdown(report: Verification): string;
export declare function sarif(report: Verification): unknown;
export declare function artifacts(report: Verification): {
    'evidence.json': string;
    'report.json': string;
    'report.md': string;
    'report.sarif': string;
};
