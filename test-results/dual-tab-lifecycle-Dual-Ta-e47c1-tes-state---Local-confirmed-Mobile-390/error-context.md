# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dual-tab-lifecycle.spec.ts >> Dual-Tab Child & Parent Lifecycle E2E Hardening >> Full lifecycle: Child creates hug request -> Parent responds -> Child updates state -> Local confirmed
- Location: tests/e2e/dual-tab-lifecycle.spec.ts:22:3

# Error details

```
Error: browserType.launch: Executable doesn't exist at /root/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     npx playwright install                                 ║
║                                                            ║
║ <3 Playwright Team                                         ║
╚════════════════════════════════════════════════════════════╝
```