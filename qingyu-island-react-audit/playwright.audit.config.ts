import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/audit-e2e',
  outputDir: './audit/browser-results',
  forbidOnly: !!process.env.CI,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'audit/browser-run.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:3179',
    browserName: 'chromium',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {name:'mobile-360',use:{viewport:{width:360,height:800},hasTouch:true,isMobile:true}},
    {name:'mobile-390',use:{viewport:{width:390,height:844},hasTouch:true,isMobile:true}},
    {name:'mobile-430',use:{viewport:{width:430,height:932},hasTouch:true,isMobile:true}},
    {name:'tablet-768',use:{viewport:{width:768,height:1024},hasTouch:true}},
    {name:'tablet-1024',use:{viewport:{width:1024,height:1366},hasTouch:true}},
    {name:'desktop-1440',use:{viewport:{width:1440,height:960}}},
  ],
  webServer: {
    command:'npm run dev',
    url:'http://127.0.0.1:3179',
    env:{NODE_ENV:'development',HOST:'127.0.0.1',PORT:'3179'},
    reuseExistingServer:false,
    timeout:60000,
  },
});
