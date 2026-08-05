/**
 * Process uptime as an HH:MM:SS string.
 *
 * Inlined from @mitchallen/uptime 0.0.8 (MIT, same author) — the package was a
 * single untyped CommonJS function, which TypeScript 7 rejects with TS7016
 * rather than inferring `any` as 5.x did. Vendoring it drops a runtime
 * dependency instead of adding an ambient declaration for 28 lines of code.
 */

const pad = (n: number): string => (n < 10 ? '0' : '') + n;

export const toHHMMSS = (): string => {
    const t = process.uptime();

    const hours = Math.floor(t / (60 * 60));
    const minutes = Math.floor((t % (60 * 60)) / 60);
    const seconds = Math.floor(t % 60);

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};
